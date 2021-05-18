const express = require('express');
const { validate } = require('express-validation');

const { memberController } = require('../controllers');
const { checkTokenApp } = require('../../../middlewares/app');

const router = express.Router();

router.route('/').get(checkTokenApp, memberController.getProfile);