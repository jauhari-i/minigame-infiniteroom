const UserGame = require('../../../models/v2/UserGame');
const LeaderBoard = require('../../../models/v2/Leaderboard');
const User = require('../../../models/v2/Users');
const { v4: uuid } = require('uuid');

module.exports = leaderBoardService = {
  joinGame: async (code, decoded) => {
    const { sub } = decoded;
    try {
      const userGame = await UserGame.findOne({ code: code, active: 0, deletedAt: null });
      if (!userGame) {
        throw {
          code: 404,
          message: 'Code game is invalid',
        };
      } else {
        const members = userGame.members;
        const userIndex = members.findIndex((x) => x.userId === sub);
        const userData = members[userIndex];

        const updateUserGame = await UserGame.updateOne(
          { userGameId: userGame.userGameId },
          { active: 1, activeUser: userData.userId }
        );

        if (!updateUserGame) {
          throw {
            code: 500,
            message: 'Internal server error',
          };
        } else {
          return {
            code: 200,
            message: 'Join game successful',
            data: {
              userGameId: userGame.userGameId,
              userId: userGame.userId,
              gameId: userGame.gameId,
              detail: userGame.detail,
              members: userGame.members,
              code: userGame.code,
              activeUser: userData.userId,
            },
          };
        }
      }
    } catch (error) {
      return error;
    }
  },
  generateCode: async (userGameId) => {
    try {
      const generateCodes = (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      };
      const codes = generateCodes(8);
      const userGame = await UserGame.findOne({ userGameId: userGameId });
      if (!userGame) {
        throw {
          code: 404,
          message: 'User Game is not found',
        };
      } else {
        const updateQuery = await UserGame.updateOne(
          { userGameId: userGame.userGameId },
          { code: codes, editedAt: Date.now() }
        );
        if (updateQuery) {
          return {
            code: 200,
            message: 'Generate code success',
            data: {
              code: codes,
              userGame: {
                userGameId: userGame.userGameId,
                userId: userGame.userId,
                gameId: userGame.gameId,
                detail: userGame.detail,
                code: codes,
              },
            },
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
  saveGame: async (time, userGameId, gameId, teamName, teamLogo, decoded) => {
    try {
      const { sub } = decoded;
      const totalScore = time;
      const userGameData = await UserGame.findOneAndUpdate(
        { userGameId: userGameId },
        { active: 0, activeUser: '' }
      );
      if (!userGameData) {
        throw {
          code: 404,
          message: 'User game is not found',
        };
      } else {
        const userData = await User.findOne({ userId: sub });
        if (!userData) {
          throw {
            code: 404,
            message: 'User not found',
          };
        } else {
          const createLeaderBoard = await LeaderBoard.create({
            leaderBoardId: uuid(),
            leaderName: userData.name,
            teamName: teamName,
            teamIcon: teamLogo,
            members: userGameData.detail[0].members,
            gameId: gameId,
            gameDetail: userGameData.detail[0],
            code: userGameData.code,
            time: time,
            score: totalScore,
          });
          if (createLeaderBoard) {
            return {
              code: 201,
              message: 'Game saved',
              data: {
                leaderBoardId: createLeaderBoard.leaderBoardId,
                leaderName: createLeaderBoard.leaderName,
                teamName: createLeaderBoard.teamName,
                teamIcon: createLeaderBoard.teamIcon,
                members: createLeaderBoard.members,
                gameId: gameId,
                gameDetail: createLeaderBoard.gameDetail,
                code: createLeaderBoard.code,
                time: time,
                score: totalScore,
              },
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
  getLeaderboard: async (sort) => {
    try {
      const leaderboard = await LeaderBoard.find({ deletedAt: null });
      const leaderboardData = await Promise.all(
        leaderboard.map(async (item) => {
          return {
            leaderBoardId: item.leaderBoardId,
            leaderName: item.leaderName,
            teamName: item.teamName,
            teamLogo: item.teamLogo,
            members: item.members,
            gameId: item.gameId,
            gameDetail: item.gameDetail,
            code: item.code,
            time: item.time,
            score: item.score,
            createdAt: item.createdAt,
          };
        })
      );
      if (sort === 'date') {
        const newArr = leaderboardData.sort((a, b) => {
          if (new Date(a.createdAt) < new Date(b.createdAt)) return -1;
          if (new Date(a.createdAt) > new Date(b.createdAt)) return 1;
          return 0;
        });
        return {
          code: 200,
          message: 'get leaderboard success',
          data: newArr,
        };
      } else if (sort === 'game') {
        const newArr = leaderboardData.sort((a, b) =>
          a.gameDetail.title.localeCompare(b.gameDetail.title)
        );
        return {
          code: 200,
          message: 'get leaderboard success',
          data: newArr,
        };
      } else if (sort === 'leader') {
        const newArr = leaderboardData.sort((a, b) => a.leaderName.localeCompare(b.leaderName));
        return {
          code: 200,
          message: 'get leaderboard success',
          data: newArr,
        };
      } else {
        const newArr = leaderboardData.sort((a, b) => {
          if (a.score > b.score) return -1;
          if (a.score < b.score) return 1;
          return 0;
        });
        return {
          code: 200,
          message: 'get leaderboard success',
          data: newArr,
        };
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};
