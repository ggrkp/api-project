const path = require('path');

const express = require('express');
const isAuth = require('../middleware/is-auth');
const userController = require('../controllers/user');

const router = express.Router()

router.post('/auth/signup', userController.createNewUser);

router.post('/auth/login', userController.login);

router.get('/auth/logout', userController.logout);

// router.get('/api/hello', userController.getHello);
router.get('/api/hello', isAuth, userController.getHello);

module.exports = router;