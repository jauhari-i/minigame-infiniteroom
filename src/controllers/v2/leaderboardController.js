const {
  generateCode,
  getLeaderboard,
  joinGame,
  saveGame,
} = require('../../services/v2/leaderboard');

module.exports = controller = {
  joinUserGame: async (req, res) => {
    const { code } = req.body;
    const query = await joinGame(code, req.decoded);
    if (query) {
      if (!query.code) {
        return res.status(500).json({
          code: 500,
          message: 'Internal server error',
        });
      }
      return res.status(query.code).json(query);
    }
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  },
  generateNewCode: async (req, res) => {
    const { id } = req.params;
    const query = await generateCode(id);
    if (query) {
      if (!query.code) {
        return res.status(500).json({
          code: 500,
          message: 'Internal server error',
        });
      }
      return res.status(query.code).json(query);
    }
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  },
  saveUserGame: async (req, res) => {
    const { time, userGameId, gameId } = req.body;
    const query = await saveGame(time, userGameId, gameId, req.decoded);
    if (query) {
      if (!query.code) {
        return res.status(500).json({
          code: 500,
          message: 'Internal server error',
        });
      }
      return res.status(query.code).json(query);
    }
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  },
  getLeaderboardList: async (req, res) => {
    const { sort } = req.params ? req.params : 'score';
    const query = await getLeaderboard(sort);
    if (query) {
      if (!query.code) {
        return res.status(500).json({
          code: 500,
          message: 'Internal server error',
        });
      }
      return res.status(query.code).json(query);
    }
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  },
};
