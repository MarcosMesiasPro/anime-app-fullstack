const Favorite = require('../models/Favorite');

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    // req.user viene del authMiddleware
    const favorites = await Favorite.find({ user: req.user.id })
      .sort({ createdAt: -1 }); // Más recientes primero

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add anime to favorites
// @route   POST /api/favorites
// @access  Private
exports.addFavorite = async (req, res) => {
  try {
    const { animeId, title, coverImage, averageScore, genres, episodes, status } = req.body;

    // Validación
    if (!animeId || !title || !coverImage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide animeId, title and coverImage'
      });
    }

    // Check si ya existe
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      animeId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Anime already in favorites'
      });
    }

    // Crear favorito
    const favorite = await Favorite.create({
      user: req.user.id,
      animeId,
      title,
      coverImage,
      averageScore,
      genres,
      episodes,
      status
    });

    res.status(201).json({
      success: true,
      data: favorite
    });

  } catch (error) {
    console.error('Add favorite error:', error);
    
    // Error de duplicado (por si acaso)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Anime already in favorites'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove anime from favorites
// @route   DELETE /api/favorites/:id
// @access  Private
exports.removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    // Verificar que el favorito pertenece al user actual
    if (favorite.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this favorite'
      });
    }

    await favorite.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Favorite removed',
      data: {}
    });

  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove favorite by animeId (alternative)
// @route   DELETE /api/favorites/anime/:animeId
// @access  Private
exports.removeFavoriteByAnimeId = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      animeId: req.params.animeId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Favorite removed',
      data: favorite
    });

  } catch (error) {
    console.error('Remove favorite by animeId error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Check if anime is in favorites
// @route   GET /api/favorites/check/:animeId
// @access  Private
exports.checkFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user.id,
      animeId: req.params.animeId
    });

    res.status(200).json({
      success: true,
      isFavorite: !!favorite, // Convierte a boolean
      data: favorite || null
    });

  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};