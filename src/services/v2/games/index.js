const { v4: uuid } = require('uuid');
const Game = require('../../../models/v2/Games');
const Admin = require('../../../models/v2/Admin');
const UserGame = require('../../../models/v2/UserGame');

module.exports = gameService = {
  addGame: async (
    { title, posterUrl, imageUrl, genre, price, description, difficulty, capacity, duration, url },
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
        url,
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
          url: game.url,
        },
      };
    } catch (error) {
      return error;
    }
  },
  getGameList: async () => {
    try {
      const games = await Game.find({ deletedAt: null });
      if (games.length === 0) {
        return {
          code: 200,
          message: 'Get games success',
          data: [],
        };
      } else {
        const gameData = await games.map((item) => ({
          gameId: item.gameId,
          title: item.title,
          posterUrl: item.posterUrl,
          imageUrl: item.imageUrl,
          genre: item.genre,
          price: item.price,
          description: item.description,
          difficulty: item.difficulty,
          duration: item.duration,
          capacity: item.capacity,
          rating: item.rating,
          url: item.url,
          createdAt: item.createdAt,
          createdBy: item.createdBy,
        }));
        return {
          code: 200,
          message: 'Get games success',
          data: gameData,
        };
      }
    } catch (error) {
      return error;
    }
  },
  getGameListWeb: async (decoded) => {
    try {
      const userGame = await UserGame.find({ userId: decoded.sub });
      const games = await Game.find({ deletedAt: null });
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
          url: item.url,
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
                url: game.url,
                code: user.code,
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
                url: game.url,
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
  getDetailGame: async (id) => {
    try {
      const game = await Game.findOne({ gameId: id, deletedAt: null });
      if (!game) {
        throw {
          code: 404,
          message: 'Game not found',
        };
      }
      return {
        code: 200,
        message: 'Get detail game success',
        data: {
          gameId: game.gameId,
          title: game.title,
          posterUrl: game.posterUrl,
          imageUrl: game.imageUrl,
          genre: game.genre,
          price: game.price,
          description: game.description,
          difficulty: game.difficulty,
          duration: game.duration,
          capacity: game.capacity,
          rating: game.rating,
          url: game.url,
          createdAt: game.createdAt,
          createdBy: game.createdBy,
        },
      };
    } catch (error) {
      return error;
    }
  },
  editGame: async (
    { title, posterUrl, imageUrl, genre, price, description, difficulty, capacity, duration },
    id
  ) => {
    try {
      const oldData = await Game.findOne({ gameId: id, deletedAt: null });
      if (!oldData) {
        throw {
          code: 404,
          message: 'Game not found',
        };
      } else {
        const posterUrls = posterUrl ? posterUrl : oldData.posterUrl;
        const imageUrls = imageUrl ? imageUrl : oldData.imageUrl;
        const query = await Game.updateOne(
          {
            gameId: id,
            deletedAt: null,
          },
          {
            title,
            posterUrl: posterUrls,
            imageUrl: imageUrls,
            genre,
            price,
            description,
            difficulty,
            capacity,
            duration,
            editedAt: Date.now(),
          }
        );
        if (query) {
          return {
            code: 200,
            message: 'Game updated',
          };
        } else {
          return {
            code: 400,
            message: 'Update game failed',
          };
        }
      }
    } catch (error) {
      return error;
    }
  },
  deleteGame: async (id) => {
    try {
      const query = await Game.updateOne(
        { gameId: id, deletedAt: null },
        { deletedAt: Date.now(), editedAt: Date.now() }
      );
      if (query) {
        return {
          code: 200,
          message: 'Game Deleted',
        };
      } else {
        return {
          code: 400,
          message: 'Delete game failed',
        };
      }
    } catch (error) {
      return error;
    }
  },
};
