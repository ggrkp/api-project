const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const { validationResult } = require('express-validator/check')
// ! LOGIN CONTROLLER

exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    let loadedUser
    User.findOne({ where: { email: email } })
        .then(user => {
            if (!user) {
                const error = new Error('A user with this email could not be found.')
                error.statusCode = 401
                throw error
            }
            loadedUser = user
            console.log(loadedUser)
            return bcrypt.compare(password, user.password)
        })
        .then((isEqual) => {
            if (!isEqual) {
                const error = new Error('Incorrect credentials.')
                error.statusCode = 401
                throw error
            }
            //if password is correct then create JWT !
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    isAdmin: loadedUser.is_admin,
                    userId: loadedUser.id.toString()
                },
                'top_secret_key',
                {
                    expiresIn: '1h'
                })
            //! set a cookie for the user authentication token JWT.
            // res.cookie('token', token,);
            res.status(200).json({ token: token, userId: loadedUser.id.toString(), isAdmin: loadedUser.is_admin })
            // res.end('Success from api!')
        })
        .catch(err => {
            // if (!err.statusCode) {
            //     err.statusCode = 500
            // }
            return res.status(err.statusCode).send(err.message)
            // next(err)
        })
}

// ! SIGNUP CONTROLLER
// todo: check if email exists already in database.
exports.postSignup = (req, res, next) => {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const is_admin = req.body.is_admin
    User.findOne({ where: { email: email } })
        .then(user => {
            if (user) {
                const error = new Error('A user with this email already exists.')
                error.statusCode = 401
                throw error
            }
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                console.log(errors.array()[0].msg)
                return res.status(422).send(errors.array()[0].msg)
            }
            bcrypt.hash(password, 12)
                .then(hashedPw => User.create({
                    name: name,
                    email: email,
                    password: hashedPw,
                    is_admin: is_admin,
                }))
                .then(res.end('success'))
                .catch((err) => { return res.status(err.statusCode).send(err.message) })
        }).catch((err) => { return res.status(err.statusCode).send(err.message) })
}


exports.getHello = (req, res, next) => {
    res.json({ message: "Hello from api" })
}


exports.getRole = (req, res, next) => {
    res.json({ role: req.role })
}