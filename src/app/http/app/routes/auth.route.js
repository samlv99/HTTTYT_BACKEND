const express = require('express');
const { validate } = require('express-validation');

const {login, register, requestAccessToken, changePassword } = require('../validations/auth.validation');
const { authController } = require('../controllers');
const { checkTokenApp, checkRefreshToken } = require('../../../middlewares');

const router = express.Router();

router.route('/register').post(validate(register), authController.register);
router.route('/login').post(validate(login), authController.login);
router.route('/change-password').post(checkTokenApp, validate(changePassword), authController.changePassword);
router
    .route('/request-access-token')
    .post(checkRefreshToken, validate(requestAccessToken), authController.requestAccessToken);

module.exports = router;