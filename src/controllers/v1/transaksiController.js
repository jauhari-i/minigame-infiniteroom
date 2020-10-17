const transaksiService = require('../../services/Transaksi');

module.exports = transaksiController = {
  createTransaction: async (req, res) => {
    const { game } = req.body;
    const query = await transaksiService.checkoutTransaction(game, req.decoded);
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
  uploadBukti: async (req, res) => {
    const photo = req.file;
    const photoUrl = photo.path;
    const { token } = req.body;
    const query = await transaksiService.addBukti({ photoUrl, token }, req.decoded);
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
