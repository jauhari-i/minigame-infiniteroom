const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  friendId: {
    type: String,
  },
  friendName: {
    type: String,
  },
  friendOnline: {
    type: Boolean,
    default: false,
  },
  accepted: {
    type: Boolean,
    default: false,
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
