const User = require('../../models/Users');
const bcryptjs = require('bcryptjs');
const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('../../middlewares/sendVerificationEmail');

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
        uuid: uuid(),
        nama: nama,
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
          sub: user.uuid,
          nama: user.sendVerificationEmail,
        },
        'minigames-verification',
        { expiresIn: '30m' }
      );
      await sendVerificationEmail(email, token, (err, info) => {
        if (err) {
          return {
            code: 400,
            message: emails.message,
          };
        }
        return;
      });
      return {
        code: 201,
        message: 'Register user success',
        data: {
          user: {
            uuid: user.uuid,
            nama: user.nama,
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
          },
        },
      };
    } catch (error) {
      return error;
    }
  },
  loginUser: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email: email });
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
          sub: user.uuid,
          nama: user.nama,
          role: 0,
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
      const checkVerify = await User.findOne({ uuid: decoded.sub });
      if (checkVerify.isVerified) {
        return {
          code: 200,
          message: 'User is already verified',
        };
      }
      const user = await User.updateOne(
        { uuid: decoded.sub },
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
        uuid: decoded.sub,
      });
      if (!user)
        throw {
          code: 404,
          message: 'User not found',
        };
      await sendVerificationEmail(email, token, (err, info) => {
        if (err) {
          return {
            code: 400,
            message: emails.message,
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
};
