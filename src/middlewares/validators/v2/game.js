const { check } = require('express-validator');

module.exports = gameValidator = {
  addGame: [
    check('title').not().isEmpty().withMessage('Title is required'),
    check('price').not().isEmpty().withMessage('Price is required'),
    check('rating').not().isEmpty().withMessage('Rating is required'),
    check('discount').not().isEmpty().withMessage('Discount is required'),
    check('difficulty').not().isEmpty().withMessage('Difficulty is required'),
    check('capacity').not().isEmpty().withMessage('Capacity is required'),
    check('duration').not().isEmpty().withMessage('Duration is required'),
    check('url').not().isEmpty().withMessage('Url is required'),
  ],
};
