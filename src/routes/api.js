const router = require('express').Router();
const allApi = require('express-list-endpoints');

const isAdmin = require('../middlewares/isAdmin');
const basicAuth = require('../middlewares/basicAuth');
const requireAuth = require('../middlewares/requireAuth');
const uploadImage = require('../middlewares/uploadImages');

const authController = require('../controllers/v1/authController');
const userController = require('../controllers/v1/userController');
const adminController = require('../controllers/v1/adminController');
const gameController = require('../controllers/v1/gameController');
const transaksiController = require('../controllers/v1/transaksiController');
const cartController = require('../controllers/v1/cartController');

const authValidator = require('../middlewares/validators/auth');
const userValidator = require('../middlewares/validators/users');
const adminValidator = require('../middlewares/validators/admin');
const gameValidator = require('../middlewares/validators/game');
const transaksiValidator = require('../middlewares/validators/transaksi');

router.get('/', (req, res) => {
  const api = allApi(router);
  res.status(200).json({ api: api, length: api.length });
});

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

router.get('/transaction/user', requireAuth, transaksiController.userTransaction);
router.get(
  '/transaction/list',
  [requireAuth, isAdmin.cekAdmin],
  transaksiController.listTransactionAll
);
router.get(
  '/transaction/detail/:id',
  [requireAuth, isAdmin.cekAdmin],
  transaksiController.detailTransaction
);
router.post('/transaction/checkout', requireAuth, transaksiController.createTransaction);
router.post(
  '/transaction/upload-bukti',
  [requireAuth, uploadImage.single('bukti')],
  transaksiController.uploadBukti
);
router.put(
  '/transaction/accept/:id',
  [requireAuth, isAdmin.cekAdmin],
  transaksiController.confirmTransaction
);
router.put(
  '/transaction/reject/:id',
  [requireAuth, isAdmin.cekAdmin, transaksiValidator.rejectTransaction],
  transaksiController.rejectTransaction
);
router.delete(
  '/transaction/delete/:id',
  [requireAuth, isAdmin.cekSuperAdmin],
  transaksiController.deleteTranaction
);

router.get('/cart/user', requireAuth, cartController.getCartUser);
router.get('/cart/add/:id', requireAuth, cartController.addCartGames);
router.get('/cart/remove/:id', requireAuth, cartController.removeCartGames);

module.exports = router;
