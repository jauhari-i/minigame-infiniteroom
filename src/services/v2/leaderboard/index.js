const UserGame = require('../../../models/v2/UserGame');
const LeaderBoard = require('../../../models/v2/Leaderboard');
const User = require('../../../models/v2/Users');
const Game = require('../../../models/v2/Games');
const { v4: uuid } = require('uuid');

const timeGlobal = [9, 12, 15, 19];

const getTimeStart = (t) => {
  const tIndex = t - 1;
  return timeGlobal[tIndex];
};

const getTimeEnd = (t, d) => {
  const tIndex = t - 1;
  const timeUser = timeGlobal[tIndex];
  const hDuration = d / 60;
  return timeUser + hDuration;
};

const getExpired = (date, timeStart, timeEnd) => {
  const today = new Date();
  const tDate = today.getDate();
  const hours = today.getHours();
  const month = today.getMonth();
  const playDate = new Date(date);
  const pDate = playDate.getDate();
  const pHours = timeStart;
  const pEnd = timeEnd;
  const pMonth = playDate.getMonth();

  if (playDate > today) {
    return 0;
  } else if (playDate <= today) {
    if (tDate === pDate && month === pMonth) {
      if (hours > pEnd) {
        return 1;
      } else if (hours <= pEnd) {
        return 0;
      } else {
        return 1;
      }
    } else {
      return 1;
    }
  } else {
    return 1;
  }
};

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
        console.log(members);
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
              playingDate: userGame.playingDate,
              timeStart: userGame.timeStart,
              timeEnd: userGame.timeEnd,
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
  generateCode: async (userGameId, date, time) => {
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
      const game = await Game.findOne({ gameId: userGame.gameId });
      if (!userGame) {
        throw {
          code: 404,
          message: 'User Game is not found',
        };
      } else {
        const updateQuery = await UserGame.updateOne(
          { userGameId: userGame.userGameId },
          {
            code: codes,
            active: 0,
            activeUser: '',
            playingDate: date,
            expired:
              getExpired(date, getTimeStart(time), getTimeEnd(time, game.duration)) === 1
                ? true
                : false,
            timeStart: getTimeStart(time),
            timeEnd: getTimeEnd(time, game.duration),
            editedAt: Date.now(),
          }
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
                playingDate: userGame.playingDate,
                expired:
                  getExpired(date, getTimeStart(time), getTimeEnd(time, game.duration)) === 1
                    ? true
                    : false,
                timeStart: userGame.timeStart,
                timeEnd: userGame.timeEnd,
                members: userGame.members,
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
          const game = await Game.findOne({ gameId: userGameData.gameId });
          const createLeaderBoard = await LeaderBoard.create({
            leaderBoardId: uuid(),
            leaderName: userData.name,
            teamName: teamName,
            teamIcon: teamLogo,
            members: userGameData.members,
            gameId: gameId,
            gameDetail: {
              gameId: game.gameId,
              title: game.title,
              posterUrl: game.posterUrl,
              imageUrl: game.imageUrl,
              genre: game.genre,
              price: game.price,
              discount: game.discount,
              rating: game.rating,
              // discountPrice: game.discountPrice,
              description: game.description,
              difficulty: game.difficulty,
              duration: game.duration,
              capacity: game.capacity,
              rating: game.rating,
              createdAt: game.createdAt,
              createdBy: game.createdBy,
            },
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
      return error;
    }
  },
};
