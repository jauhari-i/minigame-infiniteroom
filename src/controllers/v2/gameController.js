const { gameServices } = require('../../services/v2');
const { validationResult } = require('express-validator');

const gameService = gameServices;

module.exports = gameController = {
  addGame: async (req, res) => {
    const err = validationResult(req);
    if (err.errors.length) {
      let messages = err.errors.map((m) => ({
        message: m.msg,
      }));
      res.status(400).json(messages);
    } else {
      const files = req.files;
      let posterUrl;
      let imageUrl;
      files.poster.map((item) => {
        return (posterUrl = item.path);
      });
      files.image.map((item) => {
        return (imageUrl = item.path);
      });
      const { title, genre, price, discount, description, rating, difficulty, capacity, duration, url } = req.body;
      // let discountPrice = req.body.price - req.body.price*req.body.discount/100
      const query = await gameService.addGame(
        {
          title,
          posterUrl,
          imageUrl,
          genre,
          price,
          discount,
          rating,
          // discountPrice,
          description,
          difficulty,
          capacity,
          duration,
          url,
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
    }
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
  gameListAdmin: async (req, res) => {
    const query = await gameService.getGameList();
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
  detailGame: async (req, res) => {
    const {
      decoded,
      params: { id },
    } = req;
    const query = await gameService.getDetailGame(id, decoded);
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
  updateGame: async (req, res) => {
    const err = validationResult(req);
    if (err.errors.length) {
      let messages = err.errors.map((m) => ({
        message: m.msg,
      }));
      res.status(400).json(messages);
    } else {
      const files = req.files;
      const { id } = req.params;
      let posterUrl;
      let imageUrl;
      files.poster.map((item) => {
        return (posterUrl = item.path);
      });
      files.image.map((item) => {
        return (imageUrl = item.path);
      });
      const { title, genre, price, discount, description, rating, difficulty, capacity, duration, url } = req.body;
      const query = await gameService.editGame(
        {
          title,
          posterUrl,
          imageUrl,
          genre,
          price,
          discount,
          rating,
          // discountPrice:price - price*discount/100,
          description,
          difficulty,
          capacity,
          duration,
          url,
        },
        id
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
    }
  },
  deleteGame: async (req, res) => {
    const { id } = req.params;
    const query = await gameService.deleteGame(id);
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
  userGameList: async (req, res) => {
    const query = await gameService.getUserGamelist();
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
