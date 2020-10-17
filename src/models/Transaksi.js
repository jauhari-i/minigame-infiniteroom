const mongoose = require('mongoose');

const transaksiSchema = new mongoose.Schema({
  transaksiId: {
    type: String,
  },
  games: {
    type: Array,
  },
  total: {
    type: Number,
    default: 0,
  },
  status: {
    type: Number,
    default: 0,
  },
  buktiPembayaran: {
    type: String,
  },
  userId: {
    type: String,
  },
  adminId: {
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

const Transaksi = mongoose.model('transaksi', transaksiSchema);

module.exports = Transaksi;
