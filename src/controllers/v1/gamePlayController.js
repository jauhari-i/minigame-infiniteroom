const { gamePlayServices } = require('../../services/v1');

module.exports = gamePlayController = {
  enterRoom: async (req, res) => {
    const { code } = req.body;
    const query = await gamePlayServices.enterGame(code, req.decoded);
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
