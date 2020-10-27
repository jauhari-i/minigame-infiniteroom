const User = require('../../models/Users');

module.exports = userServices = {
  getProfile: async (decoded) => {
    try {
      const user = await User.findOne({ userId: decoded.sub, deletedAt: null });
      if (!user) {
        throw {
          code: 404,
          message: 'User not found',
        };
      }

      function calculateAge(birthday) {
        // birthday is a date
        var ageDifMs = Date.now() - birthday.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
      }

      const age = user.birthday ? calculateAge(user.birthday) : 0;
      return {
        code: 200,
        message: 'Get user profile success',
        data: {
          userId: user.userId,
          name: user.name,
          username: user.username,
          email: user.email,
          city: user.city,
          province: user.province,
          photoUrl: user.userPhotos,
          phoneNumber: user.phoneNumber,
          age: age,
          birthday: user.birthday,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      return error;
    }
  },
  updateProfile: async (
    { name, username, city, province, photoUrl, birthday, phoneNumber },
    decoded
  ) => {
    try {
      const user = await User.findOne({ userId: decoded.sub, deletedAt: null });
      const url = photoUrl ? photoUrl : user.userPhotos;
      const query = await User.updateOne(
        { userId: decoded.sub },
        {
          name: name,
          userame: username,
          city: city,
          province: province,
          userPhotos: url,
          birthday: birthday,
          phoneNumber: phoneNumber,
          editedAt: Date.now(),
        }
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
    } catch (error) {
      return error;
    }
  },
  getListUsers: async () => {
    try {
      const users = await User.find({ deletedAt: null });
      if (users.length === 0) {
        return {
          code: 200,
          message: 'Get users success',
          data: [],
        };
      }
      const usersData = users.map((u) => ({
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
      }));
      return {
        code: 200,
        message: 'Get users success',
        data: usersData,
      };
    } catch (error) {
      return error;
    }
  },
  deleteUser: async (id) => {
    try {
      const query = await User.updateOne(
        { userId: id, deletedAt: null },
        { editedAt: Date.now(), deletedAt: Date.now() }
      );
      if (!query) {
        throw {
          code: 404,
          message: 'User not found',
        };
      }
      return {
        code: 200,
        message: 'User deleted',
      };
    } catch (error) {
      return error;
    }
  },
};
