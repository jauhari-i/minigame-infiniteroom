const { dashbaordServices } = require('../../services/v2');

const { getDashboard } = dashbaordServices;

module.exports = dashboardController = {
  fetchDashboard: async (req, res) => {
    const { decoded: sub } = req;
    const query = await getDashboard(sub);
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
