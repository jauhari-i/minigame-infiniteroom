const UserGame = require('../../../models/v2/UserGame');
const User = require('../../../models/v2/Users');
const Game = require('../../../models/v2/Games');
const Transaction = require('../../../models/v2/Transaction');
const Admin = require('../../../models/v2/Admin');
const jwt = require('jsonwebtoken');

module.exports = dashboardService = {
  getDashboard: async (sub) => {
    try {
      const admin = await Admin.findOne({ adminId: sub.sub, deletedAt: null });
      const userCount = await User.countDocuments({ deletedAt: null });
      const gameCount = await Game.countDocuments({ deletedAt: null });
      const transactionCount = await Transaction.countDocuments({ deletedAt: null });
      const adminCount = await Admin.countDocuments({ deletedAt: null });
      const codeCount = await UserGame.countDocuments({ deletedAt: null });

      var tday = new Date();

      tday.setDate(tday.getDate() - 30);

      const lastMonthTrans = await Transaction.find({ createdAt: { $gte: tday }, deletedAt: null });
      const lastMonthUser = await User.find({ createdAt: { $gte: tday }, deletedAt: null });

      const transactionData = await Promise.all(
        lastMonthTrans.map(async (item) => {
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
          message: 'Get dashboard success',
          data: {
            userCount,
            gameCount,
            transactionCount,
            adminCount: admin.level === 1 ? adminCount : null,
            codeCount,
            lastMonthTrans: transactionData,
            lastMonthUser: lastMonthUser.map((u) => ({
              userId: u.userId,
              name: u.name,
              email: u.email,
              username: u.username,
              city: u.city,
              province: u.province,
              birthday: u.birthday,
              phoneNumber: u.phoneNumber,
              isVerified: u.isVerified,
              createdAt: u.createdAt,
            })),
            lastMonthTransCount: transactionData.length,
            lastMonthUserCount: lastMonthUser.length,
          },
        };
      } else {
        throw {
          code: 500,
          message: 'Internal server error',
        };
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};
