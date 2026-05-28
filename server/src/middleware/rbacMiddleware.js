/**
 * RBAC Middleware
 * 
 * Enterprise-grade route protection using the dynamic RBAC system.
 * Supports:
 *   - Role-based authorization (single or multiple roles)
 *   - Permission-based authorization (module:action pattern)
 *   - Combined role + permission checks
 *   - Hierarchy-based access (higher level roles inherit access)
 * 
 * Usage:
 *   router.get('/students', protect, requireRole('admin', 'faculty'), handler);
 *   router.post('/students', protect, requirePermission('students:create'), handler);
 *   router.delete('/users/:id', protect, requirePermission('users:delete'), handler);
 */

import Role from '../models/rbac/Role.js';
import UserRole from '../models/rbac/UserRole.js';
import RolePermission from '../models/rbac/RolePermission.js';
import Permission from '../models/rbac/Permission.js';

// ─── Cache (in-memory, refreshed periodically) ──────────
let permissionCache = {};
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function loadPermissionCache() {
  const now = Date.now();
  if (now - cacheTimestamp < CACHE_TTL && Object.keys(permissionCache).length > 0) {
    return;
  }

  try {
    const roles = await Role.find({ isActive: true }).lean();
    const newCache = {};

    for (const role of roles) {
      const rolePerms = await RolePermission.find({ role: role._id, isActive: true })
        .populate('permission', 'slug module action')
        .lean();

      newCache[role.slug] = {
        level: role.level,
        permissions: rolePerms
          .filter((rp) => rp.permission)
          .map((rp) => ({
            slug: rp.permission.slug,
            module: rp.permission.module,
            action: rp.permission.action,
            conditions: rp.conditions || {},
          })),
      };
    }

    permissionCache = newCache;
    cacheTimestamp = now;
  } catch (error) {
    console.error('Failed to load permission cache:', error.message);
  }
}

// Force-refresh cache (call after role/permission changes)
export function invalidatePermissionCache() {
  cacheTimestamp = 0;
  permissionCache = {};
}

// ─── Get user roles with caching ─────────────────────────
async function getUserRoleSlugs(userId) {
  const userRoles = await UserRole.find({ user: userId, isActive: true })
    .populate('role', 'slug level')
    .lean();

  if (userRoles.length > 0) {
    return userRoles.map((ur) => ({
      slug: ur.role.slug,
      level: ur.role.level,
    }));
  }

  // Fallback: use legacy role field on User
  const userRole = userId?.role;
  if (userRole) {
    return [{ slug: userRole, level: 50 }];
  }

  return [];
}

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * requireRole — Authorize by role slug(s)
 * 
 * Checks if the authenticated user has ANY of the specified roles.
 * Super-admin bypasses all role checks.
 * 
 * @param {...string} allowedRoles - Role slugs to allow
 */
export function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        return next(error);
      }

      // Get user's roles from the junction table
      const userRoles = await getUserRoleSlugs(req.user._id);

      // Also check legacy role field as fallback
      if (req.user.role) {
        const hasLegacy = userRoles.some((r) => r.slug === req.user.role);
        if (!hasLegacy) {
          userRoles.push({ slug: req.user.role, level: 50 });
        }
      }

      // Super-admin bypasses everything
      if (userRoles.some((r) => r.slug === 'super-admin')) {
        req.userRoles = userRoles;
        return next();
      }

      // Check if user has any of the allowed roles
      const hasRole = userRoles.some((ur) =>
        allowedRoles.includes(ur.slug)
      );

      if (!hasRole) {
        const error = new Error(
          `Forbidden: Your role is not authorized to access this resource`
        );
        error.statusCode = 403;
        return next(error);
      }

      req.userRoles = userRoles;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * requirePermission — Authorize by permission slug(s)
 * 
 * Checks if the user's roles grant ANY of the specified permissions.
 * Supports "module:action" format (e.g., "students:create").
 * Super-admin bypasses all permission checks.
 * 
 * @param {...string} requiredPermissions - Permission slugs (e.g., "students:create")
 */
export function requirePermission(...requiredPermissions) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        return next(error);
      }

      await loadPermissionCache();

      // Get user's role slugs
      const userRoles = await getUserRoleSlugs(req.user._id);

      // Also check legacy role field
      if (req.user.role) {
        const hasLegacy = userRoles.some((r) => r.slug === req.user.role);
        if (!hasLegacy) {
          userRoles.push({ slug: req.user.role, level: 50 });
        }
      }

      // Super-admin bypasses everything
      if (userRoles.some((r) => r.slug === 'super-admin')) {
        req.userRoles = userRoles;
        req.userPermissions = ['*'];
        return next();
      }

      // Collect all permissions from all user roles
      const userPermSlugs = new Set();
      for (const ur of userRoles) {
        const cached = permissionCache[ur.slug];
        if (cached) {
          cached.permissions.forEach((p) => userPermSlugs.add(p.slug));
        }
      }

      // Check if user has any required permission
      const hasPermission = requiredPermissions.some((rp) => userPermSlugs.has(rp));

      if (!hasPermission) {
        const error = new Error(
          `Forbidden: You don't have permission to perform this action`
        );
        error.statusCode = 403;
        return next(error);
      }

      req.userRoles = userRoles;
      req.userPermissions = [...userPermSlugs];
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * requireRoleLevel — Authorize by hierarchy level
 * 
 * Allows access if user's highest role level is <= the specified threshold.
 * Lower number = higher authority (super-admin = 0, student = 80).
 * 
 * @param {number} maxLevel - Maximum level allowed (inclusive)
 */
export function requireRoleLevel(maxLevel) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        return next(error);
      }

      const userRoles = await getUserRoleSlugs(req.user._id);

      // Also check legacy role
      if (req.user.role) {
        const hasLegacy = userRoles.some((r) => r.slug === req.user.role);
        if (!hasLegacy) {
          userRoles.push({ slug: req.user.role, level: 50 });
        }
      }

      const highestLevel = Math.min(...userRoles.map((r) => r.level));

      if (highestLevel > maxLevel) {
        const error = new Error('Forbidden: Insufficient role level');
        error.statusCode = 403;
        return next(error);
      }

      req.userRoles = userRoles;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// ─── Legacy compatibility wrapper ────────────────────────
export const authorizeRoles = requireRole;
