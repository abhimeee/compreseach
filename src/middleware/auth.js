const jwt = require('jsonwebtoken');

// Middleware to verify token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Token is required.');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(401).send('Invalid Token.');
        req.user = user;
        next();
    });
}

module.exports = { verifyToken };