const router = require('express').Router();
const allApi = require('express-list-endpoints');

const v1 = require('./v1');
const v2 = require('./v2');

router.get('/', (req, res) => {
  const api = allApi(router);
  res.status(200).json({ api: api, length: api.length });
});

router.use('/v1', v1);
router.use('/v2', v2);

module.exports = router;
