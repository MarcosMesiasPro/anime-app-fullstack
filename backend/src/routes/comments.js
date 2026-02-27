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
const { protect } = require('../middleware/authMiddleware');

// ✅ Public routes CON optional auth (para userLiked)
router.get('/anime/:animeId', optionalAuth, getCommentsByAnime);
router.get('/user/:userId', getCommentsByUser);
router.get('/stats/:animeId', getCommentStats);

// Protected routes
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleLike);

module.exports = router;