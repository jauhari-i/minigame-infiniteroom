const mongoose = require('mongoose');

const gamePlaySchema = new mongoose.Schema({
  gamePlayId: {
    type: String,
  },
  leaderId: {
    type: String,
    default: '',
  },
  leaderName: {
    type: String,
    default: '',
  },
  teamName: {
    type: String,
  },
  teamLogo: {
    type: String,
  },
  members: {
    type: Array,
    default: [],
  },
  code: {
    type: String,
  },
  time: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
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

module.exports = mongoose.model('gameplay', gamePlaySchema);
