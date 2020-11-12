const UserGame = require('../../../models/v2/UserGame')

module.exports = leaderBoardService = {
  joinGame: async (code, decoded) => {
    const {sub} = decoded
    try {
    } catch (error) {
      return error
    }
  },
  generateCode: async (userGameId, decoded) => { },
  saveGame: async (time, gameId, decoded) => { },
  getLeaderboard: async () => { },
}