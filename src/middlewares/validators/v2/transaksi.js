const { check } = require('express-validator');

module.exports = transaksiValidator = {
  rejectTransaction: [check('reason').not().isEmpty().withMessage('Reason is required')],
};
