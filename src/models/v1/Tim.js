const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamId: {
    type: String,
  },
  teamName: {
    type: String,
  },
  teamLogo: {
    type: String,
  },
  members: {
    type: Array,
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

module.exports = mongoose.model('tim', teamSchema);
