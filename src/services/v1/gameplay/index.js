const Game = require('../../../models/v1/Games');
const GamePlay = require('../../../models/v1/Gameplay');
const UserGame = require('../../../models/v1/UserGame');
const User = require('../../../models/v1/Users');
const Team = require('../../../models/v1/Tim');
const { v4: uuid } = require('uuid');

module.exports = gamePlayService = {
  enterGame: async (code, decoded) => {
    try {
      const usergame = await UserGame.findOne({ code: code, deletedAt: null });
      if (!usergame) {
        throw {
          code: 404,
          message: 'Code not found',
        };
      }
      const game = await Game.findOne({ gameId: usergame.gameId, deletedAt: null });
      if (!game) {
        throw {
          code: 404,
          message: 'Game not found',
        };
      }
      const user = await User.findOne({ userId: decoded.sub, isVerified: true });
      if (!user) {
        throw {
          code: 404,
          message: 'User not found',
        };
      }
      const team = await Team.findOne({ code: code, deletedAt: null });
      if (team) {
        const member = team.members;
        if (member.length === game.capacity) {
          throw {
            code: 400,
            message: 'Team is full',
          };
        } else {
          member.push({
            userId: user.userId,
            username: user.username,
            name: user.name,
          });
          const newMember = await Team.updateOne(
            {
              teamId: team.teamId,
              deletedAt: null,
            },
            {
              members: member,
              editedAt: Date.now(),
            }
          );
          return {
            code: 201,
            message: 'Team created',
            teamId: team.teamId,
          };
        }
      } else {
        const newTeam = await Team.create({
          teamId: uuid(),
          teamName: '',
          teamLogo: '',
          members: [
            {
              userId: user.userId,
              username: user.username,
              name: user.name,
            },
          ],
          code: usergame.code,
        });
        return {
          code: 201,
          message: 'Team created',
          teamId: newTeam.teamId,
        };
      }
    } catch (error) {
      return error;
    }
  },
  saveGame: async (teamId, leaderId, date, status, time, decoded) => {},
};
