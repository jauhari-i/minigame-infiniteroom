const { authServices } = require('../../services/v1');
const { validationResult } = require('express-validator');

const authService = authServices;

module.exports = authController = {
  registerUser: async (req, res) => {
    const err = validationResult(req);
    if (err.errors.length) {
      let messages = err.errors.map((m) => ({
        message: m.msg,
      }));
      res.status(400).json(messages);
    } else {
      const { name, email, username, password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        res.status(400).json({
          code: 400,
          message: 'Password confirmation not match',
        });
      }
      const query = await authService.registerUser({ name, email, username, password });
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
  loginUser: async (req, res) => {
    const err = validationResult(req);
    if (err.errors.length) {
      let messages = err.errors.map((m) => ({
        message: m.msg,
      }));
      res.status(400).json(messages);
    } else {
      const { email, password } = req.body;
      const query = await authService.loginUser({ email, password });
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
  verifyUser: async (req, res) => {
    const { token } = req.params;
    const query = await authService.verifyUser(token);
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
  requestVerification: async (req, res) => {
    const { token } = req.params;
    const query = await authService.verifyUserEmailRequest(token);
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
  forgotPassword: async (req, res) => {
    const err = validationResult(req);
    if (err.errors.length) {
      let messages = err.errors.map((m) => ({
        message: m.msg,
      }));
      res.status(400).json(messages);
    } else {
      const { email } = req.body;
      const query = await authService.forgotPassword({ email });
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
  changeForgotPassword: async (req, res) => {
    const err = validationResult(req);
    if (err.errors.length) {
      let messages = err.errors.map((m) => ({
        message: m.msg,
      }));
      res.status(400).json(messages);
    } else {
      let token = req.params.token;
      const { password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        res.status(400).json({
          code: 400,
          message: 'Password confirmation not match',
        });
      }
      const query = await authService.changePassword(password, token);
      if (query) {
        console.log(query);
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
  changeUserPassword: async (req, res) => {
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
      const query = await authService.changePasswordUser(password, req.decoded);
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
};
