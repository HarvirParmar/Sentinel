const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Not authorized. Token required.'
        });
    }

    try {
        const decoded = jwt.verify(
            token.split(' ')[1],
            process.env.JWT_SECRET
        );

        req.user = decoded;
        next();

    } catch (error) {
        res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    res.status(403).json({
        message: 'Admin access required'
    });
};

module.exports = { protect, adminOnly };