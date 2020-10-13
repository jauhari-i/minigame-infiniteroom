function cekAdmin(req, res, next) {
  let decoded = req.decoded;
  if (!decoded) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
  if (decoded.role === 0) {
    return res.status(403).json({
      message: 'Forbidden',
    });
  } else {
    next();
  }
}

function cekSuperAdmin(req, res, next) {
  let decoded = req.decoded;
  if (!decoded) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
  if (decoded.role === 0) {
    return res.status(403).json({
      message: 'Forbidden',
    });
  } else if (decoded.level === 0) {
    return res.status(403).json({
      message: 'Forbidden',
    });
  } else {
    next();
  }
}

module.exports = admins = {
  cekAdmin,
  cekSuperAdmin,
};
