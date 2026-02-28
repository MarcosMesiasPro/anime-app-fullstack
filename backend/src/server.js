require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/logger');

// Initialize app
const app = express();

// ✅ Trust proxy PRIMERO
app.set('trust proxy', 1);

// Connect to database
connectDB();

logger.info('🚀 Starting server...');
logger.info(`📍 Environment: ${process.env.NODE_ENV}`);

// ✅ ORDEN CORRECTO DE MIDDLEWARE:

// 1. CORS primero
app.use(cors());

// 2. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Sanitization
app.use(mongoSanitize());

// 4. Rate limiting DESPUÉS de body parsers
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/health', require('./routes/health'));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Anime API - Backend is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      favorites: '/api/favorites',
      comments: '/api/comments',
      users: '/api/users',
      health: '/api/health'
    }
  });
});

// Error handler (last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📍 http://localhost:${PORT}`);
});