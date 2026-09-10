// Middleware to enforce RBAC and prevent Insecure Direct Object Reference (IDOR)

export const verifySelfOrSuperAdmin = (req, res, next) => {
  const admin = req.admin;
  const targetId = req.params.id || req.body.id;

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Unauthenticated user',
    });
  }

  // Allow if user is superadmin OR target ID matches authenticated user's ID
  const isSuperAdmin = admin.role === 'superadmin';
  const isSelf = admin.id && targetId && String(admin.id) === String(targetId);

  if (isSuperAdmin || isSelf) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access Denied (403 Forbidden): You do not have authorization to modify or access this resource.',
  });
};

export const verifyInquiryAccess = (req, res, next) => {
  const admin = req.admin;

  if (!admin || !admin.role) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Admin authorization required for inquiry access',
    });
  }

  const allowedRoles = ['admin', 'superadmin'];
  if (!allowedRoles.includes(admin.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied (403 Forbidden): Insufficient administrative privileges.',
    });
  }

  next();
};

export default {
  verifySelfOrSuperAdmin,
  verifyInquiryAccess,
};
