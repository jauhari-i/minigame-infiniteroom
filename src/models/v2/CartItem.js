const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  cartItemId: {
    type: String,
  },
  cartGameId: {
    type: String,
  },
  cartGameData: {
    type: Object,
  },
  dateTimePlay: {
    type: Date,
  },
  members: {
    type: Array,
  },
  membersCount: {
    type: Number,
  },
  price: {
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

module.exports = mongoose.model('cartItemV2', cartItemSchema);
