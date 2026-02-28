require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize'); // ← NUEVO
const connectDB = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter'); // ← NUEVO
const errorHandler = require('./middleware/errorHandler'); // ← NUEVO
const logger = require('./config/logger'); // ← NUEVO

// Initialize app
const app = express();

// Connect to database
connectDB();

logger.info('🚀 Starting server...');
logger.info(`📍 Environment: ${process.env.NODE_ENV}`);

// Middleware
app.use(cors()); // Permitir requests desde frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
// ✅ NUEVO: Apply rate limiting to all /api routes
app.use('/api/', apiLimiter);
// ✅ NUEVO: Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/favorites', require('./routes/favorites')); // ✅ NUEVO
app.use('/api/comments', require('./routes/comments')); // ✅ NUEVO

// Health check
app.use('/api/health', require('./routes/health'));

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error:', { // ← NUEVO
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// ✅ AGREGAR ESTO:
// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Anime API - Backend is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health'
    }
  });
});

// ✅ NUEVO: Error handler (DEBE ir al final, después de routes)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📍 http://localhost:${PORT}`);
});