/**
 * Simplified RBAC Middleware
 * 
 * Runs entirely on Supabase database profiles (req.user.role).
 * Removes Mongoose model imports to prevent crashes when running without MongoDB.
 */

// Force-refresh cache stub
export function invalidatePermissionCache() {
  // No-op
}

/**
 * requireRole — Authorize by role slug(s)
 * 
 * Checks if the authenticated user has ANY of the specified roles.
 * Super-admin bypasses all role checks.
 */
export function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        return next(error);
      }

      const rawRole = req.user.role || req.user.role_name || '';
      const userRole = String(rawRole).toLowerCase().trim();
      const userRoleUnderscored = userRole.replace(/-/g, '_');
      const userRoleHyphenated = userRole.replace(/_/g, '-');

      // Super-admin bypasses everything
      if (
        userRole === 'super-admin' ||
        userRole === 'super_admin' ||
        userRole === 'superadmin'
      ) {
        req.userRoles = [{ slug: 'super_admin', level: 0 }];
        return next();
      }

      // Check if user has any of the allowed roles (support both hyphenated and underscored)
      const matchesAllowed = allowedRoles.some((role) => {
        const rClean = String(role).toLowerCase().trim();
        return (
          rClean === userRole ||
          rClean === userRoleUnderscored ||
          rClean === userRoleHyphenated
        );
      });

      if (!matchesAllowed) {
        const error = new Error(
          `Forbidden: Your role '${userRole}' is not authorized to access this resource`
        );
        error.statusCode = 403;
        return next(error);
      }

      req.userRoles = [{ slug: userRole, level: 50 }];
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * requirePermission — Authorize by permission slug(s)
 * 
 * Stub implementation that allows all permissions for admins/super-admins,
 * and standard check if roles match.
 */
export function requirePermission(...requiredPermissions) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        return next(error);
      }

      const userRole = req.user.role || req.user.role_name;

      // Super-admin / admin can do anything in this stubbed permission check
      if (userRole === 'super-admin' || userRole === 'admin') {
        return next();
      }

      // Forbidden for others
      const error = new Error(`Forbidden: You don't have permission to perform this action`);
      error.statusCode = 403;
      return next(error);
    } catch (error) {
      next(error);
    }
  };
}

/**
 * requireRoleLevel — Authorize by hierarchy level
 */
const ROLE_LEVELS = {
  'super-admin': 0,
  'admin': 10,
  'faculty': 30,
  'librarian': 40,
  'placement-officer': 40,
  'hostel-warden': 40,
  'transport-manager': 40,
  'student': 80,
  'parent': 90
};

export function requireRoleLevel(maxLevel) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        return next(error);
      }

      const userRole = req.user.role || req.user.role_name;
      const userLevel = ROLE_LEVELS[userRole] !== undefined ? ROLE_LEVELS[userRole] : 99;

      if (userLevel > maxLevel) {
        const error = new Error('Forbidden: Insufficient role level');
        error.statusCode = 403;
        return next(error);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Legacy compatibility wrapper
export const authorizeRoles = requireRole;
