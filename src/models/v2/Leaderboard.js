const mongoose = require('mongoose');

const leaderBoardSchema = new mongoose.Schema({
  leaderBoardId: { type: String, default: '' },
  leaderName: { type: String, default: '' },
  teamName: { type: String, default: '' },
  teamIcon: { type: String, default: '' },
  members: { type: Array, default: [] },
  gameId: { type: String, default: '' },
  gameDetail: { type: Object },
  code: { type: String, default: '' },
  time: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
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

module.exports = mongoose.model('leaderboardv2', leaderBoardSchema);
