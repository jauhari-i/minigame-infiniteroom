const router = require('express').Router();

const isAdmin = require('../../middlewares/isAdmin');
const basicAuth = require('../../middlewares/basicAuth');
const requireAuth = require('../../middlewares/requireAuth');
const uploadImage = require('../../middlewares/uploadImages');

const {
  adminController,
  authController,
  cartController,
  gameController,
  leaderboardController,
  transactionController,
  userController,
} = require('../../controllers/v2');

const authValidator = require('../../middlewares/validators/v2/auth');
const userValidator = require('../../middlewares/validators/v2/users');
const adminValidator = require('../../middlewares/validators/v2/admin');
const gameValidator = require('../../middlewares/validators/v2/game');
const transactionValidator = require('../../middlewares/validators/v2/transaksi');

router.post(
  '/admin/register',
  [requireAuth, isAdmin.cekSuperAdmin, adminValidator.registerAmin],
  adminController.registerAdmin
);
router.post('/admin/login', [basicAuth, adminValidator.loginAdmin], adminController.loginAdmin);
router.get('/admin/profile', [requireAuth, isAdmin.cekAdmin], adminController.getProfile);
router.get('/admin/list', [requireAuth, isAdmin.cekSuperAdmin], adminController.getListAdmin);
router.get(
  '/admin/detail/:id',
  [requireAuth, isAdmin.cekSuperAdmin],
  adminController.getDetailAdmin
);
router.put(
  '/admin/edit-profile',
  [requireAuth, isAdmin.cekAdmin, uploadImage.single('photos'), adminValidator.updateProfile],
  adminController.updateAdmin
);
router.put(
  '/admin/change-password',
  [requireAuth, isAdmin.cekAdmin, adminValidator.changePassword],
  adminController.changePasswordAdmin
);
router.delete('/admin/:id', [requireAuth, isAdmin.cekSuperAdmin], adminController.deleteAdmin);

router.get('/user/list', [requireAuth, isAdmin.cekAdmin], userController.getListUser);
router.get('/user/profile', requireAuth, userController.getProfileUser);
router.put(
  '/user/edit-profile',
  [requireAuth, uploadImage.single('photos'), userValidator.updateUser],
  userController.updateProfile
);
router.delete('/user/:id', [requireAuth, isAdmin.cekAdmin], userController.deleteUser);

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

router.post(
  '/game/create',
  [
    requireAuth,
    uploadImage.fields([{ name: 'poster' }, { name: 'image' }]),
    isAdmin.cekAdmin,
    gameValidator.addGame,
  ],
  gameController.addGame
);
router.get('/game/web', requireAuth, gameController.gameListDashboard);
router.get('/game/list', [requireAuth, isAdmin.cekAdmin], gameController.gameListAdmin);
router.get('/game/detail/:id', requireAuth, gameController.detailGame);
router.put(
  '/game/update/:id',
  [
    requireAuth,
    uploadImage.fields([{ name: 'poster' }, { name: 'image' }]),
    isAdmin.cekAdmin,
    gameValidator.addGame,
  ],
  gameController.updateGame
);
router.delete('/game/delete/:id', [requireAuth, isAdmin.cekAdmin], gameController.deleteGame);

router.get('/cart/user', requireAuth, cartController.getUserCart);
router.post('/cart/add', requireAuth, cartController.addItemsToCart);
router.put('/cart/remove/:cartItemId', requireAuth, cartController.removeItemFromCart);

router.get(
  '/transaction/list',
  [requireAuth, isAdmin.cekAdmin],
  transactionController.getListTransaction
);
router.post('/transaction/checkout', requireAuth, transactionController.checkoutTransactionUser);
router.get('/transaction/user', requireAuth, transactionController.getUserTransaction);
router.get('/transaction/detail/:id', requireAuth, transactionController.getDetailTransaction);
router.delete(
  '/transaction/delete/:id',
  [requireAuth, isAdmin.cekSuperAdmin],
  transactionController.deleteTransactionData
);
router.put(
  '/transaction/accept/:id',
  [requireAuth, isAdmin.cekAdmin],
  transactionController.acceptUserTransaction
);
router.put(
  '/transaction/reject/:id',
  [requireAuth, isAdmin.cekAdmin, transactionValidator.rejectTransaction],
  transactionController.rejectUserTransaction
);
router.put(
  '/transaction/upload-bukti/:id',
  [requireAuth, uploadImage.single('file')],
  transactionController.uploadTransaction
);

module.exports = router;
