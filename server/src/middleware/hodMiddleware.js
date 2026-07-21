export const requireHODRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized, no user attached' });
  }

  const userRole = (req.user.role || '').toLowerCase();
  const allowedRoles = ['hod', 'principal', 'super-admin', 'admin'];

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: HOD role required to access department management APIs.',
    });
  }

  // Extract department from user profile or request query
  const userDept = req.user.department || req.user.dept || req.query.department || 'AIML';
  req.departmentCode = String(userDept).toUpperCase().trim();

  next();
};

export const departmentIsolationMiddleware = (req, res, next) => {
  const reqDept = (req.query.department || req.body.department || req.departmentCode || 'AIML').toUpperCase().trim();

  // Enforce isolation if HOD is attempting to query another department
  if (req.user && req.user.role === 'hod' && req.user.department) {
    const assignedDept = String(req.user.department).toUpperCase().trim();
    if (reqDept !== assignedDept) {
      return res.status(403).json({
        success: false,
        message: `Department Isolation Violation: HOD assigned to ${assignedDept} cannot access ${reqDept} data.`,
      });
    }
  }

  req.departmentCode = reqDept;
  next();
};
