const path = require('path');

const express = require('express');

const isAuth = require('../middleware/is-auth');

const { check } = require('express-validator/check');

const userController = require('../controllers/user');
const activityController = require('../controllers/activity');

const router = express.Router()

router.post('/auth/signup', check('email').isEmail().withMessage('Please enter a valid email address.'), userController.postSignup);

router.post('/auth/login', userController.postLogin);

router.get('/api/hello', isAuth, userController.getHello);

router.post('/api/add-activities', isAuth, activityController.postActivities);

module.exports = router;
