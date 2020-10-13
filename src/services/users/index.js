const User = require('../../models/Users');
const { v4: uuid } = require('uuid');

module.exports = userServices = {
  getProfile: async (decoded) => {
    try {
      const user = await User.findOne({ userId: decoded.sub });
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
          age: age,
          birthday: user.birthday,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      return error;
    }
  },
  updateProfile: async ({ name, username, city, province, photoUrl, birthday }, decoded) => {
    try {
      const user = await User.findOne({ userId: decoded.sub });
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
};
