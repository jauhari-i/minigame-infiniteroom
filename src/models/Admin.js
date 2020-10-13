const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  adminId: {
    type: String,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  photoUrl: {
    type: String,
    default:
      'https://res.cloudinary.com/mygalleryfile/image/upload/v1591678783/269-2697881_computer-icons-user-clip-art-transparent-png-icon_yi1dtt.png',
  },
  level: {
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

const Admin = mongoose.model('admin', adminSchema);

module.exports = Admin;
