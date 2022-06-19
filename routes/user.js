const path = require('path');

const express = require('express');

const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth')

const router = express.Router()

router.post('/create', userController.createNewUser);

router.post('/login', userController.login);

module.exports = router;