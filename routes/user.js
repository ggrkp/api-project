const path = require('path');

const express = require('express');
const isAuth = require('../middleware/is-auth');

const userController = require('../controllers/user');
const activityController = require('../controllers/activity');

const router = express.Router()

router.post('/auth/signup', userController.createNewUser);

router.post('/auth/login', userController.login);

router.get('/api/hello', isAuth, userController.getHello);

router.post('/api/add-activities', isAuth, activityController.addActivities);

router.post('/api/file', isAuth, activityController.getFile);

module.exports = router;
