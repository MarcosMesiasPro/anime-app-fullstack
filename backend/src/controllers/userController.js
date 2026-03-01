const User = require('../models/User');
const Comment = require('../models/Comment');
const Favorite = require('../models/Favorite');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../config/logger');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  // Get user stats
  const [favoritesCount, commentsCount] = await Promise.all([
    Favorite.countDocuments({ user: user._id }),
    Comment.countDocuments({ user: user._id })
  ]);

  // Get recent activity
  const [recentFavorites, recentComments] = await Promise.all([
    Favorite.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Comment.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
  ]);

  res.status(200).json({
    success: true,
    data: {
      user,
      stats: {
        favorites: favoritesCount,
        comments: commentsCount
      },
      recentFavorites,
      recentComments
    }
  });

  logger.info('User profile viewed', {
    profileUserId: user._id,
    viewedBy: req.user?.id || 'anonymous'
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, bio } = req.body;

  // Validation
  if (name && (name.trim().length < 2 || name.trim().length > 50)) {
    throw new ErrorResponse('Name must be between 2 and 50 characters', 400);
  }

  if (bio && bio.length > 200) {
    throw new ErrorResponse('Bio cannot exceed 200 characters', 400);
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  // Update fields
  if (name) user.name = name.trim();
  if (bio !== undefined) user.bio = bio.trim(); // Allow empty bio

  await user.save();

  logger.info('User profile updated', {
    userId: user._id,
    updatedFields: { name: !!name, bio: bio !== undefined }
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user's favorites
// @route   GET /api/users/:id/favorites
// @access  Public
exports.getUserFavorites = asyncHandler(async (req, res, next) => {
  const { limit = 20, skip = 0 } = req.query;

  const favorites = await Favorite.find({ user: req.params.id })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await Favorite.countDocuments({ user: req.params.id });

  res.status(200).json({
    success: true,
    count: favorites.length,
    total,
    data: favorites
  });
});

// @desc    Get user's comments
// @route   GET /api/users/:id/comments
// @access  Public
exports.getUserComments = asyncHandler(async (req, res, next) => {
  const { limit = 20, skip = 0 } = req.query;

  const comments = await Comment.find({ user: req.params.id })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .populate('user', 'name avatar');

  const total = await Comment.countDocuments({ user: req.params.id });

  res.status(200).json({
    success: true,
    count: comments.length,
    total,
    data: comments
  });
});