const Sequelize = require('sequelize')

const sequelize = new Sequelize('web-db', 'root', '', {
    dialect: 'mysql', host: 'localhost',
    pool: {
        idle: 200000,
        // @note https://github.com/sequelize/sequelize/issues/8133#issuecomment-359993057
        acquire: 1000000,
    }, dialectOptions: { decimalNumbers: true }
})

module.exports = sequelize