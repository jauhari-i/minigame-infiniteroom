const gameService = require('../../services/games');

module.exports = gameController = {
  addGame: async (req, res) => {
    const files = req.files;
    let posterUrl;
    let imageUrl;
    files.poster.map((item) => {
      return (posterUrl = item.path);
    });
    files.image.map((item) => {
      return (imageUrl = item.path);
    });
    const { title, genre, price, description, difficulty, capacity, duration } = req.body;
    const query = await gameService.addGame(
      {
        title,
        posterUrl,
        imageUrl,
        genre,
        price,
        description,
        difficulty,
        capacity,
        duration,
      },
      req.decoded
    );
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
  gameListDashboard: async (req, res) => {
    const query = await gameService.getGameListWeb(req.decoded);
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
