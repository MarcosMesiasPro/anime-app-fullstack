const rateLimit = require('express-rate-limit');

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  // ✅ NUEVO: Handler custom para evitar conflictos
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  }
});

// Auth endpoints (más estricto)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos de login/register
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true // No cuenta requests exitosos
});

// Comment creation (evitar spam)
const commentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // Máximo 5 comments por minuto
  message: {
    success: false,
    message: 'You are posting comments too quickly. Please slow down.'
  }
});

// Like/Unlike (evitar bots)
const likeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 likes por minuto
  message: {
    success: false,
    message: 'Too many like/unlike requests. Please wait a moment.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  commentLimiter,
  likeLimiter
};