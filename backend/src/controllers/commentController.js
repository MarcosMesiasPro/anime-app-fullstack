const Comment = require('../models/Comment');

// ✅ NUEVO: Helper para limpiar HTML
const sanitizeHtml = (text) => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove objects
    .trim();
};

// @desc    Get comments for an anime
// @route   GET /api/comments/anime/:animeId
// @access  Public
exports.getCommentsByAnime = async (req, res) => {
  try {
    const { animeId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const comments = await Comment.find({ animeId })
      .populate('user', 'name avatar') // Trae datos del user
      .sort({ createdAt: -1 }) // Más recientes primero
      .limit(parseInt(limit))
      .skip(parseInt(skip));

      // ✅ Marcar cuáles tienen like del user actual
    const commentsWithUserLiked = comments.map(comment => {
      const commentObj = comment.toObject();
      
      // Si hay user autenticado, verificar si dio like
      if (req.user) {  // ← Ahora req.user existirá si hay token
        commentObj.userLiked = comment.likes.some(
          id => id.toString() === req.user.id || id.toString() === req.user._id
        );
      } else {
        commentObj.userLiked = false;
      }
      
      return commentObj;
    });

    res.status(200).json({
      success: true,
      count: commentsWithUserLiked.length,
      data: commentsWithUserLiked
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's comments
// @route   GET /api/comments/user/:userId
// @access  Public
exports.getCommentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const comments = await Comment.find({ user: userId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });

  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { animeId, animeTitle, text } = req.body;

    // Validación
    if (!animeId || !animeTitle || !text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide animeId, animeTitle and text'
      });
    }

    // ✅ NUEVO: Sanitize input
    const sanitizedText = sanitizeHtml(text.trim());

    if (sanitizedText.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty'
      });
    }

    if (sanitizedText.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot exceed 500 characters'
      });
    }

    // Crear comentario
    const comment = await Comment.create({
      user: req.user.id,
      animeId,
      animeTitle,
      text: sanitizedText  // ← Texto limpio
    });

    await comment.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      data: comment
    });

  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (only comment owner)
exports.updateComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    // ✅ Sanitize
    const sanitizedText = sanitizeHtml(text.trim());

    if (sanitizedText.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty'
      });
    }

    if (sanitizedText.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot exceed 500 characters'
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Verificar ownership
    if (comment.user.toString() !== req.user.id && 
        comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    // Actualizar
    comment.text = sanitizedText;
    comment.isEdited = true;
    comment.editedAt = Date.now();
    await comment.save();

    await comment.populate('user', 'name avatar');

    res.status(200).json({
      success: true,
      data: comment
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (only comment owner)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Verificar ownership
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted',
      data: {}
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Toggle like on comment
// @route   POST /api/comments/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Usar el método del modelo
    const result = comment.toggleLike(req.user.id);
    await comment.save();

    res.status(200).json({
      success: true,
      data: {
        liked: result.liked,
        likesCount: result.count
      }
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get comment stats for an anime
// @route   GET /api/comments/stats/:animeId
// @access  Public
exports.getCommentStats = async (req, res) => {
  try {
    const { animeId } = req.params;

    const stats = await Comment.aggregate([
      { $match: { animeId: parseInt(animeId) } },
      {
        $group: {
          _id: null,
          totalComments: { $sum: 1 },
          totalLikes: { $sum: '$likesCount' },
          avgLikesPerComment: { $avg: '$likesCount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalComments: 0,
        totalLikes: 0,
        avgLikesPerComment: 0
      }
    });

  } catch (error) {
    console.error('Get comment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};