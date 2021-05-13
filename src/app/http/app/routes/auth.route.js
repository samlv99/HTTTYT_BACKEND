const express = require('express');
const { validate } = require('express-validation');

const {login, register, requestAccessToken, changePassword } = require('../validations/auth.validation');
const { authController } = require('../controllers');

const router = express.Router();

router.route('/register').post(validate(register), authController.register);
router.route('/login').post(validate(login), authController.login);

module.exports = router;