const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        if (req.xhr || req.path.startsWith('/api')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return res.redirect('/auth/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.session.user = decoded; // Sync session with JWT
        next();
    } catch (err) {
        res.clearCookie('token');
        if (req.xhr || req.path.startsWith('/api')) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.redirect('/auth/login');
    }
};

module.exports = authMiddleware;
