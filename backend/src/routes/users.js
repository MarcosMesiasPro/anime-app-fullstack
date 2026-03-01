const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  getUserFavorites,
  getUserComments
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Public routes
router.get('/:id', optionalAuth, getUserProfile);
router.get('/:id/favorites', getUserFavorites);
router.get('/:id/comments', getUserComments);

// Protected routes
router.put('/profile', protect, updateProfile);

module.exports = router;