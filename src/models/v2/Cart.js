const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  cartId: {
    type: String,
  },
  items: {
    type: Array,
  },
  total: {
    type: Number,
  },
  userId: {
    type: String,
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

module.exports = mongoose.model('cartV2', cartSchema);
