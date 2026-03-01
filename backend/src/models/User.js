const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${this.name}&background=random`;
    }
  },
  bio: {
    type: String,
    maxlength: 200,
    default: ''
  },
  favorites: [{
    animeId: Number,
    title: String,
    coverImage: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// ✅ MIDDLEWARE CORRECTO - Sin 'next' necesario
userSchema.pre('save', async function() {
  // Solo encripta si password fue modificado o es nuevo
  if (!this.isModified('password')) return;
  
  // Generar salt (cuánto procesamiento usar para encriptar)
  // 10 = balance entre seguridad y velocidad
  const salt = await bcrypt.genSalt(10);
  
  // Encriptar password
  this.password = await bcrypt.hash(this.password, salt);
});

// Método instance: Comparar passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  // candidatePassword = texto plano del login
  // this.password = hash guardado en DB
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método instance: Get user sin password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);