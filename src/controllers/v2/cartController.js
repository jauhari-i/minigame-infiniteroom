const { cartServices } = require('../../services/v2');

module.exports = controller = {
  addItemsToCart: async (req, res) => {
    const { dateTime, gameId, members, time } = req.body;
    const query = await cartServices.addToCart(dateTime, members, gameId, time, req.decoded);
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
  removeItemFromCart: async (req, res) => {
    const { cartItemId } = req.params;
    const query = await cartServices.removeFromCart(cartItemId, req.decoded);
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
  getUserCart: async (req, res) => {
    const query = await cartServices.getUserCart(req.decoded);
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
