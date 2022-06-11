// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     username: 'root',
//     database: 'web-db',
//     password: ''
// })

// module.exports = pool.promise();

const Sequelize = require('sequelize')

const sequelize = new Sequelize('web-db', 'root', '', {dialect: 'mysql', host: 'localhost'})

module.exports = sequelize