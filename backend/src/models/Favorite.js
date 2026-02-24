const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animeId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  // Metadata adicional del anime
  averageScore: Number,
  genres: [String],
  episodes: Number,
  status: String
}, {
  timestamps: true
});

// Índice compuesto: Un user no puede tener el mismo anime 2 veces
favoriteSchema.index({ user: 1, animeId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);