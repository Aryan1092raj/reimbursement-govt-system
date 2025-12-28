const { Roles, RolePermissions } = require('../rbac');

function requireAction(action) {
  return (req, res, next) => {
    // Demo-mode role extraction
    const rawRole =
      req.headers['x-role'] ||
      req.headers['role'];

    if (!rawRole) {
      return res.status(401).json({ error: 'Unauthorized: role missing' });
    }

    // Normalize role
    const role = Object.values(Roles).find(
      r => r.toLowerCase() === String(rawRole).toLowerCase()
    );

    if (!role) {
      return res.status(403).json({ error: 'Forbidden: invalid role' });
    }

    const allowedActions = RolePermissions[role] || [];

    if (!allowedActions.includes(action)) {
      return res.status(403).json({ error: 'Forbidden: action not allowed' });
    }

    // Attach role context
    req.role = role;

    next();
  };
}

module.exports = { requireAction };
