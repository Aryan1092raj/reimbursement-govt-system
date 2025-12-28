const { Roles } = require('../rbac');

// Demo-mode auth: extract role from header and attach a minimal user
function authMiddleware(req, _res, next) {
  const headerRole = req.headers['x-role'] || req.headers['role'];

  let normalizedRole = null;
  if (headerRole && typeof headerRole === 'string') {
    const lower = headerRole.trim().toLowerCase();
    const match = Object.values(Roles).find(r => r.toLowerCase() === lower);
    if (match) normalizedRole = match;
  }

  if (normalizedRole) {
    // Minimal demo user. Department set to dept-001 to align with sample claims.
    req.user = {
      id: 'demo-actor',
      role: normalizedRole,
      departmentId: 'dept-001'
    };
  } else {
    req.user = null;
  }

  next();
}

module.exports = { authMiddleware };