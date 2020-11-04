const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  ratingId: {
    type: String,
  },
  gameId: {
    type: String,
  },
  userId: {
    type: String,
  },
  rating: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  editedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
  },
});

const Rating = mongoose.model('rating', ratingSchema);

module.exports = Rating;
