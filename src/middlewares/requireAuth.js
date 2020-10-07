const jwt = require('jsonwebtoken');

module.exports = checkToken = async (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  !token &&
    res.status(403).json({
      msg: 'Login terlebih dahulu',
    });
  await jwt.verify(token.replace('Bearer ', ''), 'minigames-infiniteroom', (err, decoded) => {
    err &&
      res.status(401).json({
        status: 401,
        msg: 'Token tidak valid, silahkan login kembali',
        err,
      });
    req.decoded = decoded;
    next();
  });
};
