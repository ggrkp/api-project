const Sequelize = require('sequelize')

const sequelize = new Sequelize('web-db', 'root', '', {dialect: 'mysql', host: 'localhost'})

module.exports = sequelize