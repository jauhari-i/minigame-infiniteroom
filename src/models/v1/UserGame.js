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

const UserGame = mongoose.model('usergame', userGameSchema);

module.exports = UserGame;
