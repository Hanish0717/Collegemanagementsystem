/**
 * Legacy Role Middleware
 * 
 * Backward-compatible wrapper around the new RBAC system.
 * Existing routes using authorizeRoles() will continue to work.
 * 
 * For new routes, use rbacMiddleware.js instead:
 *   import { requireRole, requirePermission } from './rbacMiddleware.js';
 */

export { requireRole as authorizeRoles } from './rbacMiddleware.js';
