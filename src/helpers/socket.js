const jwt = require('jsonwebtoken');

module.exports = helpers = {
  cekAuth: async (token) => {
    const auth = await jwt.verify(token.replace('Bearer ', ''), 'minigames-infiniteroom');
    if (auth.decoded) {
      return true;
    } else {
      return false;
    }
  },
};
