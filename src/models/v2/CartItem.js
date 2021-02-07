const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  cartItemId: {
    type: String,
  },
  cartGameId: {
    type: String,
  },
  datePlay: {
    type: Date,
  },
  timeStart: {
    type: Number,
  },
  timeEnd: {
    type: Number,
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
