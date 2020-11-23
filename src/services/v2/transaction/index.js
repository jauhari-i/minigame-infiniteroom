const Cart = require('../../../models/v2/Cart');
const CartItem = require('../../../models/v2/CartItem');
const UserGame = require('../../../models/v2/UserGame');
const User = require('../../../models/v2/Users');
const Transaction = require('../../../models/v2/Transaction');
const Admin = require('../../../models/v2/Admin');
const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');

const status = {
  notUploaded: 0,
  success: 1,
  pending: 2,
  rejected: 3,
  expired: 4,
};

module.exports = services = {
  checkoutTransaction: async (cartId, decoded) => {
    const { sub } = decoded;
    try {
      const cartUser = await Cart.findOne({ cartId: cartId, userId: sub });
      if (cartUser) {
        const cartUserItems = cartUser.items;
        if (cartUserItems.length === 0) {
          throw {
            code: 400,
            message: 'Cart is empty, cannot procced',
          };
        } else {
          const transactionItems = await Promise.all(
            cartUserItems.map(async (i) => {
              const cartItemData = await CartItem.findOne({ cartItemId: i, deletedAt: null });
              return {
                cartItemId: cartItemData.cartItemId,
                cartGameId: cartItemData.cartGameId,
                cartGameData: cartItemData.cartGameData,
                members: cartItemData.members,
                membersCount: cartItemData.membersCount,
                dateTimePlay: cartItemData.dateTimePlay,
                price: cartItemData.price,
                createdAt: cartItemData.createdAt,
              };
            })
          );
          const transaksi = await Transaction.create({
            transaksiId: uuid(),
            items: transactionItems,
            total: cartUser.total,
            userId: sub,
          });
          if (transaksi) {
            const token = jwt.sign(
              {
                transaksiId: transaksi.transaksiId,
                sub,
              },
              'minigames-transaction',
              {
                expiresIn: '24h',
              }
            );
            const updatePaymentToken = await Transaction.updateOne(
              {
                transaksiId: transaksi.transaksiId,
              },
              {
                paymentToken: token,
                editedAt: Date.now(),
              }
            );
            const emptyCart = await Cart.updateOne(
              {
                cartId: cartId,
              },
              { items: [], editedAt: Date.now() }
            );
            const deleteItems = await Promise.all(
              cartUserItems.map(async (i) => {
                const cartItemData = await CartItem.deleteOne({ cartItemId: i, deletedAt: null });
                return {
                  cartItemData,
                };
              })
            );
            if (!updatePaymentToken || !emptyCart || !deleteItems) {
              throw {
                code: 500,
                message: 'Internal server error',
              };
            } else {
              return {
                code: 201,
                message: 'Transaction success',
                data: {
                  paymentToken: token,
                  transaksi: {
                    transaksiId: transaksi.transaksiId,
                    items: transaksi.items,
                    total: transaksi.total,
                    userId: transaksi.userId,
                  },
                },
              };
            }
          } else {
            throw {
              code: 500,
              message: 'Internal server error',
            };
          }
        }
      } else {
        throw {
          code: 404,
          message: 'Cart not found',
        };
      }
    } catch (error) {
      return error;
    }
  },
  uploadTransactionPayment: async (transaksiId, file, decoded) => {
    const { sub } = decoded;
    try {
      const transaksiUser = await Transaction.findOne({
        transaksiId: transaksiId,
        userId: sub,
        deletedAt: null,
      });
      if (!transaksiUser) {
        throw {
          code: 404,
          message: 'Transaction not found',
        };
      } else {
        const validateToken = await jwt.decode(transaksiUser.paymentToken, 'minigames-transaction');
        if (Date.now() < validateToken.exp * 1000) {
          const updateTransaction = await Transaction.updateOne(
            {
              transaksiId: transaksiUser.transaksiId,
            },
            {
              buktiPembayaran: file.path,
              status: status.pending,
              editedAt: Date.now(),
            }
          );
          if (updateTransaction) {
            return {
              code: 200,
              message: 'Transaction payment is uploaded',
            };
          } else {
            throw {
              code: 500,
              message: 'Internal server error',
            };
          }
        } else {
          throw {
            code: 400,
            message: 'Transaction time expired',
          };
        }
      }
    } catch (error) {
      return error;
    }
  },
  acceptTransaction: async (transaksiId, decoded) => {
    const { sub } = decoded;
    try {
      const transactionData = await Transaction.findOne({ transaksiId: transaksiId });
      if (!transactionData) {
        throw {
          code: 404,
          message: 'Transaction not found',
        };
      } else {
        if (!transactionData.buktiPembayaran) {
          throw {
            code: 400,
            message: 'Payment is not uploaded',
          };
        } else if (transactionData.status === status.success) {
          throw {
            code: 200,
            message: 'Transaction already confirmed',
          };
        } else {
          const acceptQuery = await Transaction.updateOne(
            { transaksiId: transactionData.transaksiId },
            { status: status.success, editedAt: Date.now(), adminId: sub }
          );
          if (acceptQuery) {
            const generateCode = (length) => {
              var result = '';
              var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
              var charactersLength = characters.length;
              for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
              }
              return result;
            };
            const addUserGame = await Promise.all(
              transactionData.items.map(async (item) => {
                const userGameQuery = await UserGame.create({
                  userGameId: uuid(),
                  userId: transactionData.userId,
                  gameId: item.cartGameId,
                  code: generateCode(8),
                  detail: item,
                });
                return userGameQuery;
              })
            );
            if (addUserGame) {
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
          } else {
            throw {
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
  rejectTransaction: async (transaksiId, reason, decoded) => {
    const { sub } = decoded;
    try {
      const transactionData = await Transaction.findOne({
        transaksiId: transaksiId,
        deletedAt: null,
      });
      if (!transactionData) {
        throw {
          code: 404,
          message: 'Transaction not found',
        };
      } else {
        if (transactionData.status === status.success) {
          throw {
            code: 400,
            message: 'Transaction is already confirmed',
          };
        } else {
          const rejectQuery = await Transaction.updateOne(
            { transaksiId: transactionData.transaksiId },
            {
              status: status.rejected,
              adminId: sub,
              rejectedReason: reason,
              editedAt: Date.now(),
            }
          );
          if (rejectQuery) {
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
      }
    } catch (error) {
      return error;
    }
  },
  allTransaction: async () => {
    try {
      const transactions = await Transaction.find({ deletedAt: null });
      if (transactions.length === 0) {
        return {
          code: 200,
          message: 'Get transaction success',
          data: [],
        };
      } else {
        const transactionData = await Promise.all(
          transactions.map(async (item) => {
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
            if (item.status === 0) {
              const verifyToken = jwt.decode(item.paymentToken, 'minigames-transaction');
              if (Date.now() < verifyToken.exp * 1000) {
                return {
                  transaksiId: item.transaksiId,
                  items: item.items,
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
              } else {
                const expiredTransaction = await Transaction.updateOne(
                  { transaksiId: item.transaksiId },
                  { status: status.expired, editedAt: Date.now() }
                );
                if (expiredTransaction) {
                  return {
                    transaksiId: item.transaksiId,
                    items: item.items,
                    total: item.total,
                    status: status.expired,
                    buktiPembayaran: item.buktiPembayaran,
                    user: username,
                    admin: adminname,
                    paymentToken: item.paymentToken,
                    userId: item.userId,
                    adminId: item.adminId,
                    createdAt: item.createdAt,
                  };
                }
              }
            } else {
              return {
                transaksiId: item.transaksiId,
                items: item.items,
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
            }
          })
        );
        if (transactionData) {
          return {
            code: 200,
            message: 'Get transaction success',
            data: transactionData,
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
  detailTransaction: async (id) => {
    try {
      const transaction = await Transaction.findOne({ transaksiId: id, deletedAt: null });
      if (!transaction) {
        throw {
          code: 404,
          message: 'Transaction not found',
        };
      } else {
        let username;
        let adminname;
        const user = await User.findOne({ userId: transaction.userId });
        if (user === null) {
          username = '';
        } else {
          username = user.name;
        }
        if (transaction.adminId) {
          const admin = await Admin.findOne({ adminId: transaction.adminId });
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
            transaksiId: transaction.transaksiId,
            items: transaction.items,
            total: transaction.total,
            status: transaction.status,
            buktiPembayaran: transaction.buktiPembayaran,
            user: username,
            admin: adminname,
            paymentToken: transaction.paymentToken,
            userId: transaction.userId,
            adminId: transaction.adminId,
            createdAt: transaction.createdAt,
          },
        };
      }
    } catch (error) {
      return error;
    }
  },
  userTransaction: async (decoded) => {
    const { sub } = decoded;
    try {
      const userTransactions = await Transaction.find({
        userId: sub,
        deletedAt: null,
      });
      if (userTransactions.length === 0) {
        return {
          code: 200,
          message: 'Get transaction success',
          data: [],
        };
      }
      const transactionData = await Promise.all(
        userTransactions.map(async (item) => {
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
          if (item.status === 0) {
            const verifyToken = await jwt.verify(item.paymentToken, 'minigames-transaction');
            if (verifyToken) {
              return {
                transaksiId: item.transaksiId,
                items: item.items,
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
            } else {
              const expiredTransaction = await Transaction.updateOne(
                { transaksiId: item.transaksiId },
                { status: status.expired, editedAt: Date.now() }
              );
              if (expiredTransaction) return;
              return;
            }
          } else {
            return {
              transaksiId: item.transaksiId,
              items: item.items,
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
          }
        })
      );
      return {
        code: 200,
        message: 'Get transaction success',
        data: transactionData,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  deleteTransaction: async (id) => {
    try {
      const query = await Transaction.updateOne(
        {
          transaksiId: id,
          deletedAt: null,
        },
        { deletedAt: Date.now(), editedAt: Date.now() }
      );
      if (!query) {
        throw {
          code: 500,
          message: 'Internal server error',
        };
      } else {
        return {
          code: 200,
          message: 'Delete transaction success',
        };
      }
    } catch (error) {
      return error;
    }
  },
};
