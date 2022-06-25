const path = require('path');

const express = require('express');

const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth')

const router = express.Router()

router.post('/auth/create', userController.createNewUser);

router.post('/auth/login', userController.login);

router.get('/api/hello', userController.getHello);

module.exports = router;