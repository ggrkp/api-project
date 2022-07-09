const path = require('path');

const express = require('express');

const isAuth = require('../middleware/is-auth');

const { check } = require('express-validator/check');

const userController = require('../controllers/user');
const activityController = require('../controllers/activity');
const adminController = require('../controllers/admin');

const router = express.Router()

router.post('/auth/signup', check('email').isEmail().withMessage('Please enter a valid email address.'), userController.postSignup);

router.post('/auth/login', userController.postLogin);

router.get('/api/hello', isAuth, userController.getHello);

router.post('/api/add-activities', isAuth, activityController.postActivities);

router.get('/auth/role', isAuth, userController.getRole)

router.get('/activities/get-total-score', isAuth, activityController.getTotalScore)

router.get('/activities/get-monthly-score', isAuth, activityController.getMonthlyScore)

router.get('/activities/get-leaders', isAuth, activityController.getLeaders)

router.get('/activities/records-range', isAuth, activityController.getRecordsRange)

router.get('/activities/latest-upload', isAuth, activityController.getLatestUpload)

router.get('/admin/dashboard', adminController.getDashboardData)

router.get('/admin/heatmap', adminController.getHeatmapData)

module.exports = router;
