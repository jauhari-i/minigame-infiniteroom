const { v4: uuid } = require('uuid');
const Game = require('../../../models/v2/Games');
const Admin = require('../../../models/v2/Admin');
const UserGame = require('../../../models/v2/UserGame');
const User = require('../../../models/v2/Users');

const statusGame = {
  cs: 0,
  pl: 1,
};

const getExpired = (date, timeStart, timeEnd) => {
  const today = new Date();
  const tDate = today.getDate();
  const hours = today.getHours();
  const month = today.getMonth();
  const playDate = new Date(date);
  const pDate = playDate.getDate();
  const pHours = timeStart;
  const pEnd = timeEnd;
  const pMonth = playDate.getMonth();

  if (playDate > today) {
    return 0;
  } else if (playDate <= today) {
    if (tDate === pDate && month === pMonth) {
      if (hours > pEnd) {
        return 1;
      } else if (hours <= pEnd) {
        return 0;
      } else {
        return 1;
      }
    } else {
      return 1;
    }
  } else {
    return 1;
  }
};

module.exports = gameService = {
  addGame: async (
    { title, posterUrl, imageUrl, genre, price, discount, description, difficulty, capacity, duration, url },
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
        discount,
        description,
        difficulty,
        capacity,
        duration,
        url,
        status: 0,
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
          discount: game.discount,
          description: game.description,
          difficulty: game.difficulty,
          capacity: game.capacity,
          duration: game.duration,
          url: game.url,
          status: game.status === statusGame.cs ? 'Coming Soon' : 'Get Code',
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
          discount: item.discount,
          description: item.description,
          difficulty: item.difficulty,
          duration: item.duration,
          capacity: item.capacity,
          rating: item.rating,
          url: item.url,
          status: item.status === statusGame.cs ? 'Coming Soon' : 'Get Code',
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
          gameStatus: item.status === statusGame.cs ? 'Coming Soon' : 'Get Code',
          price: item.price,
          discount: item.discount,
          url: item.url,
        }));
        return {
          code: 200,
          message: 'Get game success',
          data: gameData,
        };
      } else {
        const gamesDatas = await Promise.all(
          games.map(async (g) => {
            const gameuser = await UserGame.findOne({
              gameId: g.gameId,
              userId: decoded.sub,
              deletedAt: null,
            });
            return {
              gameId: g.gameId,
              imageUrl: g.imageUrl,
              posterUrl: g.posterUrl,
              title: g.title,
              genre: g.genre,
              rating: g.rating,
              status: gameuser !== null ? 1 : 0,
              gameStatus: g.status === statusGame.cs ? 'Coming Soon' : 'Get Code',
              price: g.price,
              discount: g.discount,
              url: g.url,
              code: gameuser !== null ? gameuser.code : '',
            };
          })
        );
        return {
          code: 200,
          message: 'Get game success',
          data: gamesDatas,
        };
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  getDetailGame: async (id, decoded) => {
    try {
      const game = await Game.findOne({ gameId: id, deletedAt: null });
      if (!game) {
        throw {
          code: 404,
          message: 'Game not found',
        };
      }
      const usergame = await UserGame.findOne({ gameId: id, userId: decoded.sub });
      if (usergame) {
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
            discount: game.discount,
            description: game.description,
            difficulty: game.difficulty,
            duration: game.duration,
            capacity: game.capacity,
            rating: game.rating,
            url: game.url,
            status: 1,
            gameStatus: game.status === statusGame.cs ? 'Coming Soon' : 'Get Code',
            createdAt: game.createdAt,
            createdBy: game.createdBy,
          },
        };
      } else {
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
            discount: game.discount,
            description: game.description,
            difficulty: game.difficulty,
            duration: game.duration,
            capacity: game.capacity,
            rating: game.rating,
            url: game.url,
            status: 0,
            gameStatus: game.status === statusGame.cs ? 'Coming Soon' : 'Get Code',
            createdAt: game.createdAt,
            createdBy: game.createdBy,
          },
        };
      }
    } catch (error) {
      return error;
    }
  },
  editGame: async (
    {
      title,
      posterUrl,
      imageUrl,
      genre,
      price,
      discount,
      status,
      description,
      difficulty,
      capacity,
      duration,
    },
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
            discount,
            description,
            difficulty,
            capacity,
            duration,
            status,
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
  getUserGamelist: async () => {
    try {
      const usersgames = await UserGame.find({ deletedAt: null });
      if (usersgames.length === 0) {
        return {
          code: 200,
          message: 'Get user game success',
          data: [],
        };
      } else {
        const data = await Promise.all(
          usersgames.map(async (item) => {
            const user = await User.findOne({ userId: item.userId, deletedAt: null });
            const game = await Game.findOne({ gameId: item.gameId, deletedAt: null });
            const rawData = {
              userGameId: item.userGameId,
              userId: item.userId,
              gameId: item.gameId,
              active: item.active,
              code: item.code,
              activeUser: item.activeUser,
              expired:
                getExpired(item.playingDate, item.timeStart, item.timeEnd) === 1 ? true : false,
              playingDate: item.playingDate,
              timeStart: item.timeStart,
              timeEnd: item.timeEnd,
              userDetail: {
                userId: user.userId,
                name: user.name,
                username: user.username,
                email: user.email,
                city: user.city,
                province: user.province,
                photoUrl: user.userPhotos,
                phoneNumber: user.phoneNumber,
                age: user.age,
                birthday: user.birthday,
                createdAt: user.createdAt,
              },
              gameDetail: {
                gameId: game.gameId,
                title: game.title,
                posterUrl: game.posterUrl,
                imageUrl: game.imageUrl,
                genre: game.genre,
                price: game.price,
                discount: game.discount,
                description: game.description,
                difficulty: game.difficulty,
                duration: game.duration,
                capacity: game.capacity,
                rating: game.rating,
                url: game.url,
                status: 1,
                createdAt: game.createdAt,
                createdBy: game.createdBy,
              },
            };
            return rawData;
          })
        );
        return {
          code: 200,
          message: 'Get user game success',
          data,
        };
      }
    } catch (error) {
      return error;
    }
  },
};
