const jwt = require('jsonwebtoken');

module.exports = checkToken = async (req, res, next) => {
  try {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token) {
      return res.status(403).json({
        message: 'Login terlebih dahulu',
      });
    } else {
      await jwt.verify(token.replace('Bearer ', ''), 'minigames-infiniteroom', (err, decoded) => {
        if (err) {
          res.status(401).json({
            code: 401,
            message: 'Token tidak valid, silahkan login kembali',
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
