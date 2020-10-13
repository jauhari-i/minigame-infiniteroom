const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
  },
  title: {
    type: String,
  },
  posterUrl: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  genre: {
    type: Object,
  },
  price: {
    type: Number,
  },
  description: {
    type: String,
  },
  difficulty: {
    type: String,
  },
  rating: {
    type: String,
    default: '0',
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

const Game = mongoose.model('game', gameSchema);

module.exports = Game;
