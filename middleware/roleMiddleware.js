const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            if (req.xhr || req.path.startsWith('/api')) {
                return res.status(403).json({ message: 'Forbidden: Access denied' });
            }
            req.session.error_msg = 'Access denied';
            return res.redirect('back');
        }
        next();
    };
};

module.exports = roleMiddleware;
