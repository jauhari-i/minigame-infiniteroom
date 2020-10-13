const userService = require('../../services/users');
const { validationResult } = require('express-validator');

module.exports = userController = {
  getProfileUser: async (req, res) => {
    const query = await userService.getProfile(req.decoded);
    if (query) {
      if (!query.code) {
        return res.status(500).json({
          code: 500,
          message: 'Internal server error',
        });
      }
      return res.status(query.code).json(query);
    }
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  },
  updateProfile: async (req, res) => {
    const err = validationResult(req);
    if (err.errors.length) {
      let messages = err.errors.map((m) => ({
        message: m.msg,
      }));
      res.status(400).json(messages);
    } else {
      const photo = req.file;
      const photoUrl = photo ? photo.path : '';
      const { name, username, city, province, birthday } = req.body;
      const query = await userService.updateProfile(
        { name, username, city, province, photoUrl, birthday },
        req.decoded
      );
      if (query) {
        if (!query.code) {
          return res.status(500).json({
            code: 500,
            message: 'Internal server error',
          });
        }
        return res.status(query.code).json(query);
      }
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
      });
    }
  },
};
