const express = require('express');
const router = express.Router();
const {
  getCommentsByAnime,
  getCommentsByUser,
  createComment,
  updateComment,
  deleteComment,
  toggleLike,
  getCommentStats
} = require('../controllers/commentController');

// ✅ optionalAuth viene del MIDDLEWARE, no del controller
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Public routes CON optional auth
router.get('/anime/:animeId', optionalAuth, getCommentsByAnime);
router.get('/user/:userId', getCommentsByUser);
router.get('/stats/:animeId', getCommentStats);

// Protected routes
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleLike);

module.exports = router;