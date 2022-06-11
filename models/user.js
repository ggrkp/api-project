const Sequelize = require('sequelize');

const sequelize = require('../database')

const User = sequelize.define('user', {
    //  type date latitude longtitude accuracy user_id activity_id
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    password: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    is_admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
},
// {
//     freezeTableName: true,

//     // define the table's name
//     tableName: 'user'
// }
)


module.exports = User