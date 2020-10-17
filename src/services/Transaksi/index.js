const { v4: uuid } = require('uuid');
const Game = require('../../models/Games');
const Admin = require('../../models/Admin');
const UserGame = require('../../models/UserGame');
const Transaksi = require('../../models/Transaksi');
const jwt = require('jsonwebtoken');

module.exports = transaksiService = {
  checkoutTransaction: async (game, decoded) => {
    try {
      if (game.length === 0) {
        throw {
          code: 400,
          message: 'Game is required',
        };
      }
      let total;
      let usergame = [];
      const transactionData = await Promise.all(
        game.map(async (item) => {
          total = 0;
          const games = await Game.findOne({ gameId: item.gameId });
          total = total + games.price;
          const gameData = {
            gameId: games.gameId,
            imageUrl: games.imageUrl,
            posterUrl: games.posterUrl,
            title: games.title,
            genre: games.genre,
            price: games.price,
          };
          usergame.push(gameData);
          if (usergame.length === game.length) {
            return {
              total,
              usergame,
            };
          }
        })
      );
      if (usergame.length === game.length) {
        const transaksi = await Transaksi.create({
          transaksiId: uuid(),
          games: transactionData[0].usergame,
          total: transactionData[0].total,
          userId: decoded.sub,
        });
        if (transaksi) {
          const token = jwt.sign({ transaksiId: transaksi.transaksiId }, 'minigames-transaction', {
            expiresIn: '72h',
          });
          return {
            code: 201,
            message: 'Transaction success',
            data: {
              token: token,
              transaksi: {
                transaksiId: transaksi.transaksiId,
                games: transaksi.games,
                total: transaksi.total,
                userId: transaksi.userID,
              },
            },
          };
        } else {
          return {
            code: 500,
            message: 'Internal server error',
          };
        }
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  addBukti: async ({ photoUrl, token }, decoded) => {
    try {
      const validateToken = await jwt.verify(token, 'minigames-transaction');
      if (!validateToken) {
        throw {
          code: 400,
          message: 'Transaction token expired',
        };
      } else {
        const transaksi = await Transaksi.findOne({
          transaksiId: validateToken.transaksiId,
          userId: decoded.sub,
        });
        if (!transaksi) {
          return {
            code: 404,
            message: 'Transaction not found',
          };
        } else {
          const query = await Transaksi.updateOne(
            { transaksiId: transaksi.transaksiId },
            { buktiPembayaran: photoUrl, editedAt: Date.now(), status: 3 }
          );
          if (!query) {
            throw {
              code: 500,
              message: 'Internal server error',
            };
          }
          return {
            code: 201,
            message: 'Upload bukti pembayaran success',
          };
        }
      }
    } catch (error) {
      return error;
    }
  },
};
