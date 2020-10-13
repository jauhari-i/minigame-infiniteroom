const { check } = require('express-validator');
const Admin = require('../../models/Admin');

module.exports = authValidator = {
  registerAmin: [
    check('name').not().isEmpty().withMessage('Nama tidak boleh kosong'),
    check('email').custom((val) => {
      if (!val) {
        return Promise.reject('Email tidak boleh kosong');
      }
      return Admin.findOne({ email: val, deletedAt: null }).then((u) => {
        if (u) {
          return Promise.reject('Email telah dipakai');
        }
      });
    }),
    check('password').not().isEmpty().withMessage('Kata sandi tidak boleh kosong'),
    check('confirmPassword').not().isEmpty().withMessage('Konfirmasi kata sandi'),
  ],
  loginAdmin: [
    check('email')
      .isEmail()
      .withMessage('Email tidak valid')
      .not()
      .isEmpty()
      .withMessage('Email tidak boleh kosong'),
    check('password').not().isEmpty().withMessage('Kata sandi tidak boleh kosong'),
  ],
  changePassword: [
    check('oldPassword').not().isEmpty().withMessage('Kata sandi lama tidak boleh kosong'),
    check('password').not().isEmpty().withMessage('Kata sandi tidak boleh kosong'),
    check('confirmPassword').not().isEmpty().withMessage('Konfirmasi kata sandi'),
  ],
  updateProfile: [check('name').not().isEmpty().withMessage('Nama tidak boleh kosong')],
};
