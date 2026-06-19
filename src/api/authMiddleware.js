const jwt = require('jsonwebtoken');

// Middleware for token-based authentication
function authenticate(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) return res.status(403).json({ error: 'Token is required for authentication.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token.' });
        req.user = decoded; // Store user information in request
        next();
    });
}

module.exports = { authenticate };