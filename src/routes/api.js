const router = require('express').Router();
const basicAuth = require('../middlewares/basicAuth');
const authValidator = require('../middlewares/validators/auth');
const authController = require('../controllers/v1/authController');

router.get('/', (req, res) => res.send('Minigames API'));

// auth
router.post('/user/register', [basicAuth, authValidator.registerUser], authController.registerUser);
router.post('/user/login', [basicAuth, authValidator.loginUser], authController.loginUser);

router.get('/verify/user/:token', authController.verifyUser);
router.get('/verify/request/:token', authController.requestVerification);

module.exports = router;
