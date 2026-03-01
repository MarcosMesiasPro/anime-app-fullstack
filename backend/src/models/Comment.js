const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animeId: {
    type: Number,
    required: true
  },
  animeTitle: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    minlength: 1,
    maxlength: 500
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

// Virtual para saber si user actual dio like (lo usaremos en frontend)
commentSchema.virtual('userLiked').get(function() {
  // Esto se llena dinámicamente en el controller
  return false;
});

// Índice para queries rápidas
commentSchema.index({ animeId: 1, createdAt: -1 });
commentSchema.index({ user: 1 });

// Método: Toggle like
commentSchema.methods.toggleLike = function(userId) {
  const userIdString = userId.toString();
  const likeIndex = this.likes.findIndex(
    id => id.toString() === userIdString
  );

  if (likeIndex > -1) {
    // User ya dio like → remove
    this.likes.splice(likeIndex, 1);
    this.likesCount = Math.max(0, this.likesCount - 1);
    return { liked: false, count: this.likesCount };
  } else {
    // User no ha dado like → add
    this.likes.push(userId);
    this.likesCount += 1;
    return { liked: true, count: this.likesCount };
  }
};

// Include virtuals cuando conviertes a JSON
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Comment', commentSchema);