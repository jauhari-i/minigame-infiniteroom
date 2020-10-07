function cekAdmin(req, res, next) {
  let decoded = req.decoded;
  if (decoded.role === 0) {
    return res.status(403).json({
      msg: 'Forbidden',
    });
  } else {
    next();
  }
}

module.exports = cekAdmin;
