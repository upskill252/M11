const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    skipSuccessfulRequests: true, // Only block based on failures
    handler: (req, res) => {
        console.warn(`IP Blocked: ${req.ip} after 5 failed attempts.`); // Task 1.2 deliverable: Server log
        res.status(429).json({ error: "IP blocked for 15 minutes due to multiple failures." });
    }
});

module.exports = loginLimiter;