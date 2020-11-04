const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  cartId: {
    type: String,
  },
  games: {
    type: Array,
    default: [],
  },
  userId: {
    type: String,
  },
  timePlay: {
    type: Date,
  },
  members: {
    type: Array,
    default: [],
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

module.exports = mongoose.model('cart', cartSchema);
