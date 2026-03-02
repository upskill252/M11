const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(403).json({ error: "Access denied. Please log in." });

    jwt.verify(token, "SECRET_KEY", (err, user) => {
        if (err) return res.status(401).json({ error: "Invalid or expired session." });
        req.user = user;
        next();
    });
};