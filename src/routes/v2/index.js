const router = require('express').Router();

router.get('test', (req, res) => {
  res.send('TEst');
});

module.exports = router;
