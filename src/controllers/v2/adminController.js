const { adminServices } = require('../../services/v2');
const { validationResult } = require('express-validator');

module.exports = adminController = {
  registerAdmin: async (req, res) => {
    const err = validationResult(req);
    if (err.errors.length) {
      let messages = err.errors.map((m) => ({
        message: m.msg,
      }));
      res.status(400).json(messages);
    } else {
      const { name, email, password } = req.body;
      const query = await adminServices.registerAdmin({ name, email, password });
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
  loginAdmin: async (req, res) => {
    const err = validationResult(req);
    if (err.errors.length) {
      let messages = err.errors.map((m) => ({
        message: m.msg,
      }));
      res.status(400).json(messages);
    } else {
      const { email, password } = req.body;
      const query = await adminServices.loginAdmin({ email, password });
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
  getProfile: async (req, res) => {
    const query = await adminServices.getProfile(req.decoded);
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
  getListAdmin: async (req, res) => {
    const query = await adminServices.getListAdmin(req.decoded);
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
  getDetailAdmin: async (req, res) => {
    const { id } = req.params;
    const query = await adminServices.getDetailAdmin(id);
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
  updateAdmin: async (req, res) => {
    const err = validationResult(req);
    if (err.errors.length) {
      let messages = err.errors.map((m) => ({
        message: m.msg,
      }));
      res.status(400).json(messages);
    } else {
      const { name } = req.body;
      const photo = req.file;
      const photoUrl = photo ? photo.path : '';
      const query = await adminServices.updateProfileAdmin({ name, photoUrl }, req.decoded);
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
  changePasswordAdmin: async (req, res) => {
    const err = validationResult(req);
    if (err.errors.length) {
      let messages = err.errors.map((m) => ({
        message: m.msg,
      }));
      res.status(400).json(messages);
    } else {
      const { oldPassword, password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        res.status(400).json({
          code: 400,
          message: 'Password confirmation not match',
        });
      }
      const query = await adminServices.changePasswordAdmin({ oldPassword, password }, req.decoded);
      if (query) {
        if (!query.code) {
          return res.status(500).json({
            code: 500,
            message: 'Internal server error',
          });
        }
        return res.status(query.code).json(query);
      } else {
        return res.status(500).json({
          code: 500,
          message: 'Internal server error',
        });
      }
    }
  },
  deleteAdmin: async (req, res) => {
    const { id } = req.params;
    const query = await adminServices.deleteAdmin(id);
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
};
