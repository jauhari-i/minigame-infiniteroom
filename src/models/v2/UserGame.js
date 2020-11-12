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
  detail: {
    type: Array,
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
