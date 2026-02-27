const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rutas
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check si token existe en headers
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
      // Format: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar user a req
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next(); // Continúa al siguiente middleware/controller

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

// ✅ NUEVO: Middleware opcional (no bloquea si no hay token)
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
      } catch (error) {
        // Token inválido, pero no bloqueamos
        console.log('Invalid token in optional auth, continuing...');
      }
    }

    // Continuar SIEMPRE (con o sin user)
    next();
  } catch (error) {
    // No importa el error, continuamos
    next();
  }
};