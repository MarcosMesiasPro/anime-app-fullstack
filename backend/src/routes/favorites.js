const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  removeFavoriteByAnimeId,
  checkFavorite
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// GET /api/favorites - Get all favorites
router.get('/', getFavorites);

// POST /api/favorites - Add favorite
router.post('/', addFavorite);

// GET /api/favorites/check/:animeId - Check if favorite
router.get('/check/:animeId', checkFavorite);

// DELETE /api/favorites/:id - Remove by favorite ID
router.delete('/:id', removeFavorite);

// DELETE /api/favorites/anime/:animeId - Remove by anime ID
router.delete('/anime/:animeId', removeFavoriteByAnimeId);

module.exports = router;