const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    default: null
  },
  umur: {
    type: Number,
    default: null
  },
  tinggiBadan: {
    type: Number,
    default: null
  },
  beratBadan: {
    type: Number,
    default: null
  },
  riwayatPenyakit: {
    type: [String],
    default: []
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'developer'],
    default: 'user'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);