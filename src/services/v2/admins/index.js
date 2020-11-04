const Admin = require('../../../models/v2/Admin');
const bcryptjs = require('bcryptjs');
const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');

module.exports = adminServices = {
  registerAdmin: async ({ name, email, password }) => {
    try {
      const encPass = await bcryptjs.hash(password, 10);
      if (!encPass) {
        throw {
          code: 500,
          message: 'Internal server error',
        };
      }
      const admin = await Admin.create({
        adminId: uuid(),
        name: name,
        email: email,
        password: encPass,
      });
      if (!admin) {
        throw {
          code: 500,
          message: 'Internal server error',
        };
      }
      return {
        code: 201,
        message: 'Admin registered',
        data: {
          adminId: admin.adminId,
          name: admin.name,
          email: admin.email,
        },
      };
    } catch (error) {
      return error;
    }
  },
  loginAdmin: async ({ email, password }) => {
    try {
      const admin = await Admin.findOne({ email: email, deletedAt: null });
      if (!admin) {
        throw {
          code: 404,
          message: 'Email not found',
        };
      }
      const comparePass = await bcryptjs.compare(password, admin.password);
      if (!comparePass) {
        throw {
          code: 400,
          message: 'Password not match',
        };
      }
      const token = jwt.sign(
        {
          sub: admin.adminId,
          nama: admin.name,
          role: 1,
          level: admin.level,
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
  getProfile: async (decoded) => {
    try {
      const admin = await Admin.findOne({ adminId: decoded.sub, deletedAt: null });
      if (!admin) {
        throw {
          code: 404,
          message: 'Admin not found',
        };
      }
      const data = {
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        photoUrl: admin.photoUrl,
        level: admin.level,
        createdAt: admin.createdAt,
      };
      return {
        code: 200,
        data,
      };
    } catch (error) {
      return error;
    }
  },
  getListAdmin: async (decoded) => {
    try {
      const admins = await Admin.find({
        adminId: { $nin: decoded.sub },
        level: 0,
        deletedAt: null,
      });
      if (admins.length === 0) {
        return {
          code: 200,
          message: 'Get list admin success',
          data: [],
        };
      }
      const data = admins.map((a) => ({
        adminId: a.adminId,
        name: a.name,
        email: a.email,
        photoUrl: a.photoUrl,
        level: a.level,
        createdAt: a.createdAt,
      }));
      return {
        code: 200,
        message: 'Get list admin success',
        data,
      };
    } catch (error) {
      return error;
    }
  },
  getDetailAdmin: async (id) => {
    try {
      const admin = await Admin.findOne({ adminId: id, deletedAt: null });

      const data = {
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        photoUrl: admin.photoUrl,
        level: admin.level,
        createdAt: admin.createdAt,
      };
      return {
        code: 200,
        message: 'Get detail admin success',
        data,
      };
    } catch (error) {
      return error;
    }
  },
  updateProfileAdmin: async ({ name, photoUrl }, decoded) => {
    try {
      const admin = await Admin.findOne({ adminId: decoded.sub, deletedAt: null });
      const url = photoUrl ? photoUrl : admin.photoUrl;
      const query = await Admin.updateOne(
        { adminId: decoded.sub },
        { name: name, photoUrl: url, editedAt: Date.now() }
      );
      if (!query) {
        throw {
          code: 500,
          message: 'Internal server error',
        };
      }
      return {
        code: 200,
        message: 'Update admin success',
      };
    } catch (error) {
      return error;
    }
  },
  changePasswordAdmin: async ({ oldPassword, password }, decoded) => {
    try {
      const admin = await Admin.findOne({ adminId: decoded.sub, deletedAt: null });
      if (!admin) {
        throw {
          code: 404,
          message: 'Admin not found',
        };
      }
      const comparePass = await bcryptjs.compare(oldPassword, admin.password);
      if (!comparePass) {
        throw {
          code: 400,
          message: 'Old password not match',
        };
      } else {
        const encPass = await bcryptjs.hash(password, 10);
        if (!encPass) {
          throw {
            code: 500,
            message: 'Internal server error',
          };
        }
        const query = await Admin.updateOne(
          { adminId: decoded.sub, deletedAt: null },
          { password: encPass, editedAt: Date.now() }
        );
        if (!query) {
          throw {
            code: 500,
            message: 'Internal server error',
          };
        }
        return {
          code: 200,
          message: 'Update user success',
        };
      }
    } catch (error) {
      return error;
    }
  },
  deleteAdmin: async (id) => {
    try {
      const query = await Admin.updateOne(
        { adminId: id, deletedAt: null },
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
        message: 'Delete admin success',
      };
    } catch (error) {
      return error;
    }
  },
};
