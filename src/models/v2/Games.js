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
    type: Array,
  },
  price: {
    type: Number,
  },
  discount: {
    type: Number,
    default: 0,
  },
  // discountPrice: {
  //   type: Number,
  //   default: 0,
  // },
  description: {
    type: String,
  },
  difficulty: {
    type: Number,
  },
  duration: {
    type: Number,
  },
  capacity: {
    type: Number,
  },
  rating: {
    type: Number,
    default: 0,
  },
  url: {
    type: String,
    default: '',
  },
  createdBy: {
    type: String,
    default: '',
  },
  status: {
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

const Game = mongoose.model('gameV2', gameSchema);

module.exports = Game;
