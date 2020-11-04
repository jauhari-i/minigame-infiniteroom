const { cartServices } = require('../../services/v2');

module.exports = controller = {
  addItemsToCart: async (req, res) => {
    const { dateTime, gameId, members } = req.body;
    const query = await cartServices.addToCart(dateTime, members, gameId, req.decoded);
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
