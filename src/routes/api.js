const router = require('express').Router();

const basicAuth = require('../middlewares/basicAuth');
const authValidator = require('../middlewares/validators/auth');
const authController = require('../controllers/v1/authController');
const requireAuth = require('../middlewares/requireAuth');
const allApi = require('express-list-endpoints');

router.get('/', (req, res) => {
  const api = allApi(router);
  res.status(200).json({ api: api });
});

// auth
router.post('/user/register', [basicAuth, authValidator.registerUser], authController.registerUser);
router.post('/user/login', [basicAuth, authValidator.loginUser], authController.loginUser);
router.post(
  '/user/forgot-password',
  [basicAuth, authValidator.forgotPassword],
  authController.forgotPassword
);
router.put(
  '/user/change-password',
  [requireAuth, authValidator.changePassword],
  authController.changeUserPassword
);
router.post(
  '/user/change-password/:token',
  [basicAuth, authValidator.changePassword],
  authController.changeForgotPassword
);

router.get('/verify/user/:token', authController.verifyUser);
router.get('/verify/request/:token', authController.requestVerification);

module.exports = router;
