const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginLimiter = require('../utils/limiter');

router.post('/register', authController.register); 

router.post('/login', loginLimiter, authController.login);

module.exports = router;