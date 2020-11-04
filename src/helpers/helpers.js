const jwt = require('jsonwebtoken');
const User = require('../models/v1/Users');

module.exports = helpers = {
  cekAuth: async (token) => {
    const auth = await jwt.verify(token.replace('Bearer ', ''), 'minigames-infiniteroom');
    if (auth.decoded) {
      return true;
    } else {
      return false;
    }
  },
  setOnline: async (userId) => {
    const query = await User.updateOne({ userId: userId }, { online: true, editedAt: Date.now() });
    if (query) {
      return true;
    } else {
      return false;
    }
  },
  setOffline: async (userId) => {
    const query = await User.updateOne({ userId: userId }, { online: false, editedAt: Date.now() });
    if (query) {
      return true;
    } else {
      return false;
    }
  },
};
