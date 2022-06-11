const User = require('../models/user')

exports.getHelloUser = (req, res) => {
    console.log('getHelloUser');
    res.json({ "user": "Hello" })
}

exports.createNewUser = (req, res, next) => {
    // const name = 'Bob'
    // const email = 'bob@test.com'
    // const password = '1234'
    // const is_admin = 0
    // const created = ''
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const is_admin = req.body.is_admin
    User.create({
        name: name,
        email: email,
        password: password,
        is_admin: is_admin,
    })
        .then(res.end('success'))

        .catch((err) => { console.error(err) })
}

exports.getAllUsers = (req, res) => {
    User.findAll()
        .then((users) => {
            res.json(users)
            console.log(users)
        })
        .catch(err => {
            console.error(err)
        })
}

exports.getUserById = (req, res) => {

    //! findAll approach
    User.findAll({ where: { id: req.params.userId } })
        .then((users) => {
            res.json(users[0])
            console.log(users[0])
        })
        .catch(err => {
            console.error(err)
        })

    // !findByPk approach - same thing.
    // User.findByPk(req.params.userId)
    //     .then((user) => {
    //         res.json(user)
    //         console.log(user)
    //     })
    //     .catch(err => {
    //         console.error(err)
    //     })
}
