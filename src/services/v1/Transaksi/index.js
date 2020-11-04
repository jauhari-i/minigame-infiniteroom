const { v4: uuid } = require('uuid');
const Game = require('../../../models/v1/Games');
const User = require('../../../models/v1/Users');
const Admin = require('../../../models/v1/Admin');
const UserGame = require('../../../models/v1/UserGame');
const Transaksi = require('../../../models/v1/Transaksi');
const Cart = require('../../../models/v1/Cart');
const jwt = require('jsonwebtoken');

module.exports = transaksiService = {
  checkoutTransaction: async (cart, decoded) => {
    try {
      const cartUser = await Cart.findOne({ cartId: cart, userId: decoded.sub, deletedAt: null });
      if (!cartUser) {
        throw {
          code: 404,
          message: 'Cart not found',
        };
      } else {
        let game = cartUser.games;
        if (game.length === 0) {
          throw {
            code: 400,
            message: 'Cart is empty',
          };
        }
        let total;
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
            return gameData;
          })
        );
        if (transactionData.length === game.length) {
          const transaksi = await Transaksi.create({
            transaksiId: uuid(),
            games: transactionData,
            total: total,
            userId: decoded.sub,
          });
          if (transaksi) {
            const token = jwt.sign(
              { transaksiId: transaksi.transaksiId },
              'minigames-transaction',
              {
                expiresIn: '72h',
              }
            );
            const query = await Transaksi.updateOne(
              { transaksiId: transaksi.transaksiId },
              { paymentToken: token, editedAt: Date.now() }
            );
            const cartQuery = await Cart.updateOne(
              { cartId: cartUser.cartId },
              { games: [], editedAt: Date.now() }
            );
            if (!query || !cartQuery) {
              throw {
                code: 500,
                message: 'Internal server error',
              };
            }
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
      }
    } catch (error) {
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
          paymentToken: token,
          deletedAt: null,
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
  acceptTransaction: async (id, decoded) => {
    try {
      const transaksi = await Transaksi.findOne({ transaksiId: id });
      if (!transaksi) {
        throw {
          code: 404,
          message: 'Transaksi tidak ditemukan',
        };
      } else {
        if (!transaksi.buktiPembayaran) {
          throw {
            code: 400,
            message: 'Bukti pembayaran belum diunggah',
          };
        }
        if (transaksi.status === 1) {
          throw {
            code: 200,
            message: 'Transaction already confirmed',
          };
        }
        const query = await Transaksi.updateOne(
          { transaksiId: transaksi.transaksiId },
          {
            status: 1,
            adminId: decoded.sub,
            editedAt: Date.now(),
          }
        );
        if (query) {
          function makeid(length) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
              result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
          }
          let numQuery = [];
          const transactionGames = await Promise.all(
            transaksi.games.map(async (item) => {
              const gameQuery = await UserGame.create({
                userGameId: uuid(),
                userId: transaksi.userId,
                gameId: item.gameId,
                code: makeid(8),
              });
              numQuery.push(gameQuery);
              if (numQuery === transaksi.games.length) {
                return {
                  numQuery,
                };
              }
            })
          );
          return {
            code: 200,
            message: 'Transaction Confirmed',
          };
        } else {
          throw {
            code: 500,
            message: 'Internal server error',
          };
        }
      }
    } catch (error) {
      return error;
    }
  },
  rejectTransaction: async (id, reason, decoded) => {
    try {
      const transaksi = await Transaksi.findOne({ transaksiId: id });
      if (!transaksi) {
        throw {
          code: 404,
          message: 'Transaksi tidak ditemukan',
        };
      } else {
        if (!transaksi.buktiPembayaran) {
          throw {
            code: 400,
            message: 'Bukti pembayaran belum diunggah',
          };
        }
        if (transaksi.status === 1) {
          throw {
            code: 200,
            message: 'Transaction already confirmed',
          };
        }
        const query = await Transaksi.updateOne(
          { transaksiId: transaksi.transaksiId },
          {
            status: 2,
            adminId: decoded.sub,
            reasonRejected: reason,
            editedAt: Date.now(),
          }
        );
        if (query) {
          return {
            code: 200,
            message: 'Transaction Rejected',
          };
        } else {
          throw {
            code: 500,
            message: 'Internal server error',
          };
        }
      }
    } catch (error) {
      return error;
    }
  },
  listTransaction: async () => {
    try {
      const transaksi = await Transaksi.find({ deletedAt: null });
      if (transaksi.length === 0) {
        return {
          code: 200,
          message: 'Get transaction success',
          data: [],
        };
      }
      const data = await Promise.all(
        transaksi.map(async (item) => {
          let username;
          let adminname;
          const user = await User.findOne({ userId: item.userId });
          if (user === null) {
            username = '';
          } else {
            username = user.name;
          }
          if (item.adminId) {
            const admin = await Admin.findOne({ adminId: item.adminId });
            if (admin === null) {
              adminname = '';
            } else {
              adminname = admin.name;
            }
          } else {
            adminname = '';
          }
          return {
            transaksiId: item.transaksiId,
            games: item.games,
            total: item.total,
            status: item.status,
            buktiPembayaran: item.buktiPembayaran,
            user: username,
            admin: adminname,
            paymentToken: item.paymentToken,
            userId: item.userId,
            adminId: item.adminId,
            createdAt: item.createdAt,
          };
        })
      );
      return {
        code: 200,
        message: 'Get transaction success',
        data: data,
      };
    } catch (error) {
      return error;
    }
  },
  detailTransaction: async (id) => {
    try {
      const transaksi = await Transaksi.findOne({ transaksiId: id, deletedAt: null });
      if (!transaksi) {
        throw {
          code: 404,
          message: 'Transaksi not found',
        };
      }
      let username;
      let adminname;
      const user = await User.findOne({ userId: transaksi.userId });
      if (user === null) {
        username = '';
      } else {
        username = user.name;
      }
      if (transaksi.adminId) {
        const admin = await Admin.findOne({ adminId: transaksi.adminId });
        if (admin === null) {
          adminname = '';
        } else {
          adminname = admin.name;
        }
      } else {
        adminname = '';
      }

      return {
        code: 200,
        message: 'Get detail transaction success',
        data: {
          transaksiId: transaksi.transaksiId,
          games: transaksi.games,
          total: transaksi.total,
          status: transaksi.status,
          buktiPembayaran: transaksi.buktiPembayaran,
          user: username,
          admin: adminname,
          paymentToken: transaksi.paymentToken,
          userId: transaksi.userId,
          adminId: transaksi.adminId,
          createdAt: transaksi.createdAt,
        },
      };
    } catch (error) {
      return error;
    }
  },
  userTransaction: async (decoded) => {
    try {
      const transaksi = await Transaksi.find({ userId: decoded.sub, deletedAt: null });
      if (transaksi.length === 0) {
        return {
          code: 200,
          message: 'Get transaction success',
          data: [],
        };
      }
      const data = await Promise.all(
        transaksi.map(async (item) => {
          let username;
          let adminname;
          const user = await User.findOne({ userId: item.userId });
          if (user === null) {
            username = '';
          } else {
            username = user.name;
          }
          if (item.adminId) {
            const admin = await Admin.findOne({ adminId: item.adminId });
            if (admin === null) {
              adminname = '';
            } else {
              adminname = admin.name;
            }
          } else {
            adminname = '';
          }
          return {
            transaksiId: item.transaksiId,
            games: item.games,
            total: item.total,
            status: item.status,
            buktiPembayaran: item.buktiPembayaran,
            user: username,
            admin: adminname,
            paymentToken: item.paymentToken,
            userId: item.userId,
            adminId: item.adminId,
            createdAt: item.createdAt,
          };
        })
      );
      return {
        code: 200,
        message: 'Get transaction success',
        data,
      };
    } catch (error) {
      return error;
    }
  },
  deleteTransaction: async (id) => {
    try {
      const query = await Transaksi.updateOne(
        { transaksiId: id, deletedAt: null },
        { deletedAt: Date.now(), editedAt: Date.now() }
      );
      if (!query) {
        throw {
          code: 500,
          message: 'Internal server error',
        };
      }
      return {
        code: 200,
        message: 'Delete transaction success',
      };
    } catch (error) {
      return error;
    }
  },
};
