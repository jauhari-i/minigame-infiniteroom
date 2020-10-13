const { check } = require('express-validator');
const User = require('../../models/Users');

module.exports = authValidator = {
  updateUser: [
    check('name').not().isEmpty().withMessage('Nama tidak boleh kosong'),
    check('username').not().isEmpty().withMessage('Username tidak boleh kosong'),
    check('city').not().isEmpty().withMessage('Kota tidak boleh kosong'),
    check('province').not().isEmpty().withMessage('Provinsi tidak boleh kosong'),
    check('birthday').not().isEmpty().withMessage('Tanggal lahir tidak boleh kosong'),
  ],
};
