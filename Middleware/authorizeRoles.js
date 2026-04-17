function authorizeRoles(...allowedRoles) {
  const normalizedAllowed = allowedRoles
    .flat()
    .filter(Boolean)
    .map((r) => String(r).toUpperCase());

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: 'Unauthorized' });
      }

      const role = req.user.role ? String(req.user.role).toUpperCase() : '';
      if (!role || !normalizedAllowed.includes(role)) {
        return res
          .status(403)
          .json({ success: false, message: 'Forbidden' });
      }

      return next();
    } catch (error) {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden' });
    }
  };
}

module.exports = authorizeRoles;

