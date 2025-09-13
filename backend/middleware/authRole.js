module.exports = (roles) => {
    // Normalize provided roles to lowercase once
    const normalizedAllowedRoles = Array.isArray(roles)
        ? roles.map(r => typeof r === 'string' ? r.toLowerCase() : r)
        : [];
    return (req, res, next) => {
        const userRole = (req.user && req.user.role ? String(req.user.role).toLowerCase() : '');
        if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};

