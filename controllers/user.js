const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

// ! LOGIN CONTROLLER

exports.login = (req, res, next) => {
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
                const error = new Error('Password is incorrect.')
                error.statusCode = 401
                throw error
            }
            //if password is correct then create JWT !
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    id: loadedUser.id.toString()
                },
                'top_secret_key',
                {
                    expiresIn: '1h'
                })
            //! set a cookie for the user authentication token JWT.
            res.status(200).cookie('token', token, { httpOnly: true });
            res.end('Success from api!')
            // res.status(200).json({ token: token, id: loadedUser.id.toString() })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}



// ! SIGNUP CONTROLLER
// todo: check if email exists already in database.
exports.createNewUser = (req, res, next) => {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const is_admin = req.body.is_admin
    bcrypt.hash(password, 12)
        .then(hashedPw => User.create({
            name: name,
            email: email,
            password: hashedPw,
            is_admin: is_admin,
        }))
        .then(res.end('success'))
        .catch((err) => { console.error(err) })
}


exports.getHello = (req, res, next) => {
    res.json({ message: "Hello from api" })
}
