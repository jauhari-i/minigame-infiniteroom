const User = require('../../../models/v2/Users');
const bcryptjs = require('bcryptjs');
const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('../../../middlewares/sendVerificationEmail');
const sendForgotEmail = require('../../../middlewares/sendForgotEmail');
const v2 = 'v2';

module.exports = authServices = {
  registerUser: async ({ nama, email, username, password }) => {
    try {
      const encPass = await bcryptjs.hash(password, 10);
      if (!encPass)
        throw {
          code: 500,
          message: 'Internal server error, failed to proccesing data',
        };
      const user = await User.create({
        userId: uuid(),
        name: nama,
        email: email,
        username: username,
        password: encPass,
      });
      if (!user)
        throw {
          code: 500,
          message: 'Internal server error, failed to registering user',
        };
      const token = jwt.sign(
        {
          sub: user.userId,
          nama: user.nama,
        },
        'minigames-verification',
        { expiresIn: '30m' }
      );
      await sendVerificationEmail(email, v2, token, (err, info) => {
        if (err) {
          return {
            code: 400,
            message: err.message,
          };
        }
        return;
      });
      return {
        code: 201,
        message: 'Register user success',
        data: {
          userId: user.userId,
          nama: user.nama,
          email: user.email,
          username: user.username,
          isVerified: user.isVerified,
        },
      };
    } catch (error) {
      return error;
    }
  },
  loginUser: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email: email, deletedAt: null });
      if (!user)
        throw {
          code: 404,
          message: 'User not exist',
        };
      if (!user.isVerified)
        throw {
          code: 404,
          message: 'User not verified',
        };
      const comparePass = await bcryptjs.compare(password, user.password);
      if (!comparePass)
        throw {
          code: 400,
          message: 'Wrong password',
        };
      const token = jwt.sign(
        {
          sub: user.userId,
          nama: user.name,
          role: 0,
          level: null,
        },
        'minigames-infiniteroom',
        { expiresIn: '24h' }
      );
      return {
        code: 200,
        message: 'Login success',
        data: {
          accessToken: token,
        },
      };
    } catch (error) {
      return error;
    }
  },
  verifyUser: async (token) => {
    try {
      const decoded = await jwt.verify(token, 'minigames-verification');
      if (!decoded)
        throw {
          code: 400,
          message: 'Token is invalid or expired',
        };
      const checkVerify = await User.findOne({ userId: decoded.sub, deletedAt: null });
      if (checkVerify.isVerified) {
        return {
          code: 200,
          message: 'User is already verified',
        };
      }
      const user = await User.updateOne(
        { userId: decoded.sub },
        {
          isVerified: true,
          verifiedAt: Date.now(),
          editedAt: Date.now(),
        }
      );
      if (!user)
        throw {
          code: 500,
          message: 'Internal server error',
        };
      return {
        code: 200,
        message: 'User is verified',
      };
    } catch (error) {
      return error;
    }
  },
  verifyUserEmailRequest: async (token) => {
    try {
      const decoded = jwt.decode(token, 'minigames-verification');
      if (!decoded)
        throw {
          code: 400,
          message: 'Token is invalid',
        };
      const user = await User.findOne({
        userId: decoded.sub,
      });
      if (!user)
        throw {
          code: 404,
          message: 'User not found',
        };
      const newToken = jwt.sign(
        {
          sub: user.userId,
          nama: user.nama,
        },
        'minigames-verification',
        { expiresIn: '30m' }
      );
      if (user.isVerified) {
        return {
          code: 200,
          message: 'User already verified',
        };
      }
      await sendVerificationEmail(user.email, v2, newToken, (err, info) => {
        if (err) {
          throw {
            code: 400,
            message: 'Failed to send email',
          };
        }
        return;
      });
      return {
        code: 200,
        message: 'Email verification has been send',
      };
    } catch (error) {
      return error;
    }
  },
  forgotPassword: async ({ email }) => {
    try {
      const user = await User.findOne({ email: email, deletedAt: null });
      if (!user)
        throw {
          code: 404,
          message: 'User not exist',
        };
      const token = jwt.sign(
        {
          sub: user.userId,
          email: user.email,
        },
        'minigames-forgot-password',
        { expiresIn: '1h' }
      );
      await sendForgotEmail(email, v2, token, (err, info) => {
        if (err) {
          return {
            code: 400,
            message: 'Failed to send email',
          };
        }
        return;
      });
      return {
        code: 200,
        message: 'Email has been sent',
      };
    } catch (error) {
      return error;
    }
  },
  changePassword: async (password, token) => {
    try {
      const decoded = await jwt.verify(token, 'minigames-forgot-password');
      if (!decoded) {
        throw {
          code: 401,
          message: 'Token expired',
        };
      }
      const encPass = await bcryptjs.hash(password, 10);
      if (!encPass) {
        throw {
          code: 500,
          message: 'Internal server error',
        };
      }
      const user = await User.findOneAndUpdate(
        { userId: decoded.sub },
        { password: encPass, editedAt: Date.now() }
      );
      return {
        code: 200,
        message: 'Change password success',
        data: {
          userId: user.userId,
        },
      };
    } catch (error) {
      return error;
    }
  },
  changePasswordUser: async ({ oldPassword, password }, decoded) => {
    try {
      const user = await User.findOne({ userId: decoded.sub, deletedAt: null });
      if (!user) {
        throw {
          code: 404,
          message: 'User not found',
        };
      }
      const comparePass = await bcryptjs.compare(oldPassword, user.password);
      if (!comparePass) {
        throw {
          code: 400,
          message: 'Old password not same',
        };
      } else {
        const encPass = await bcryptjs.hash(password, 10);
        if (!encPass) {
          throw {
            code: 500,
            message: 'Internal server error',
          };
        }
        const user = await User.findOneAndUpdate(
          { userId: decoded.sub },
          { password: encPass, editedAt: Date.now() }
        );
        return {
          code: 200,
          message: 'Change password success',
          data: {
            userId: user.userId,
          },
        };
      }
    } catch (error) {
      return error;
    }
  },
};
