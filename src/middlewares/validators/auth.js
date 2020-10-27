const { check } = require('express-validator');
const User = require('../../models/Users');

module.exports = authValidator = {
  registerUser: [
    check('name').not().isEmpty().withMessage('Nama tidak boleh kosong'),
    check('email').custom((val) => {
      if (!val) {
        return Promise.reject('Email tidak boleh kosong');
      }
      return User.findOne({ email: val, deletedAt: null }).then((u) => {
        if (u) {
          return Promise.reject('Email telah dipakai');
        }
      });
    }),
    check('username').custom((val) => {
      if (!val) {
        return Promise.reject('Username tidak boleh kosong');
      }
      return User.findOne({ username: val, deletedAt: null }).then((u) => {
        if (u) {
          return Promise.reject('Username telah dipakai');
        }
      });
    }),
    check('password').not().isEmpty().withMessage('Kata sandi tidak boleh kosong'),
    check('confirmPassword').not().isEmpty().withMessage('Konfirmasi kata sandi'),
  ],
  loginUser: [
    check('email')
      .isEmail()
      .withMessage('Email tidak valid')
      .not()
      .isEmpty()
      .withMessage('Email tidak boleh kosong'),
    check('password').not().isEmpty().withMessage('Kata sandi tidak boleh kosong'),
  ],
  forgotPassword: [
    check('email')
      .isEmail()
      .withMessage('Email tidak valid')
      .not()
      .isEmpty()
      .withMessage('Email tidak boleh kosong'),
  ],
  changePassword: [
    check('oldPassword').not().isEmpty().withMessage('Kata sandi lama tidak boleh kosong'),
    check('password').not().isEmpty().withMessage('Kata sandi tidak boleh kosong'),
    check('confirmPassword').not().isEmpty().withMessage('Konfirmasi kata sandi'),
  ],
};
