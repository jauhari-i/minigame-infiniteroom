const mongoose = require('mongoose');

const userGameSchema = new mongoose.Schema({
  userGameId: {
    type: String,
  },
  userId: {
    type: String,
  },
  gameId: {
    type: String,
  },
  code: {
    type: String,
  },
  members: {
    type: Array,
  },
  active: {
    type: Number,
    default: 0,
  },
  activeUser: {
    type: String,
  },
  playingDate: {
    type: Date,
  },
  timeStart: {
    type: Number,
  },
  timeEnd: {
    type: Number,
  },
  expired: {
    type: Boolean,
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

const UserGame = mongoose.model('usergameV2', userGameSchema);

module.exports = UserGame;
