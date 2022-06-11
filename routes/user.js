const path = require('path');

const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

router.get('/hello', userController.getHelloUser);

router.get('/get-all-users', userController.getAllUsers);

router.get('/get-user/:userId', userController.getUserById);

router.post('/create', userController.createNewUser);

module.exports = router;