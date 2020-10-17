const { v4: uuid } = require('uuid');
const Game = require('../../models/Games');
const Admin = require('../../models/Admin');
const UserGame = require('../../models/UserGame');

module.exports = gameService = {
  addGame: async (
    { title, posterUrl, imageUrl, genre, price, description, difficulty, capacity, duration },
    decoded
  ) => {
    try {
      const admin = await Admin.findOne({ adminId: decoded.sub });
      if (!admin) {
        throw {
          code: 404,
          message: 'Admin not found',
        };
      }
      const game = await Game.create({
        gameId: uuid(),
        title,
        posterUrl,
        imageUrl,
        genre,
        price,
        description,
        difficulty,
        capacity,
        duration,
        createdBy: admin.name,
      });
      if (!game)
        throw {
          code: 500,
          message: 'Internal server error',
        };
      return {
        code: 201,
        message: 'Game added successfully',
        data: {
          gameId: game.gameId,
          title: game.title,
          posterUrl: game.posterUrl,
          imageUrl: game.imageUrl,
          genre: game.genre,
          price: game.price,
          description: game.description,
          difficulty: game.difficulty,
          capacity: game.capacity,
          duration: game.duration,
        },
      };
    } catch (error) {
      return error;
    }
  },
  getGameList: async () => {},
  getGameListWeb: async (decoded) => {
    try {
      const userGame = await UserGame.find({ userId: decoded.sub });
      const games = await Game.find();
      if (games.length === 0) {
        return {
          code: 200,
          message: 'Get game success',
          data: [],
        };
      }
      if (userGame.length === 0) {
        const gameData = games.map((item) => ({
          gameId: item.gameId,
          imageUrl: item.imageUrl,
          posterUrl: item.posterUrl,
          title: item.title,
          genre: item.genre,
          rating: item.rating,
          status: 0,
          price: item.price,
        }));
        return {
          code: 200,
          message: 'Get game success',
          data: gameData,
        };
      } else {
        let gamesData = [];
        userGame.map((user) => {
          games.map((game) => {
            if (game.gameId === user.gameId) {
              gamesData.push({
                gameId: game.gameId,
                imageUrl: game.imageUrl,
                posterUrl: game.posterUrl,
                title: game.title,
                genre: game.genre,
                rating: game.rating,
                status: 1,
                price: game.price,
              });
            } else {
              gamesData.push({
                gameId: game.gameId,
                imageUrl: game.imageUrl,
                posterUrl: game.posterUrl,
                title: game.title,
                genre: game.genre,
                rating: game.rating,
                status: 0,
                price: game.price,
              });
            }
          });
        });
        return {
          code: 200,
          message: 'Get game success',
          data: gamesData,
        };
      }
    } catch (error) {
      return error;
    }
  },
  getDetailGame: async () => {},
  editGame: async () => {},
  deleteGame: async () => {},
};
