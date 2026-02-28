const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter'); // ← NUEVO

// ✅ Apply auth limiter to login/register
// router.post('/register', authLimiter, register);
// router.post('/login', authLimiter, login);

// Protected route
router.get('/me', protect, getMe);

module.exports = router;