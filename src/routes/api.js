const router = require('express').Router();

const basicAuth = require('../middlewares/basicAuth');
const requireAuth = require('../middlewares/requireAuth');
const uploadImage = require('../middlewares/uploadImages');
const allApi = require('express-list-endpoints');

const authController = require('../controllers/v1/authController');
const userController = require('../controllers/v1/userController');

const authValidator = require('../middlewares/validators/auth');
const userValidator = require('../middlewares/validators/users');

router.get('/', (req, res) => {
  const api = allApi(router);
  res.status(200).json({ api: api });
});

router.get('/user/profile', requireAuth, userController.getProfileUser);
router.put(
  '/user/edit-profile',
  [requireAuth, uploadImage.single('photos'), userValidator.updateUser],
  userController.updateProfile
);

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
