const Sequelize = require('sequelize');

const sequelize = require('../database')

const Activity = sequelize.define('activity',
    {
        activity_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        type: {
            type: Sequelize.STRING(100)
        },
        latitude: {
            type: Sequelize.DECIMAL(8, 6)
        },
        longtitude: {
            type: Sequelize.DECIMAL(9, 6)
        },
        accuracy: {
            type: Sequelize.DOUBLE
        },
        date: {
            type: Sequelize.DATE
        }
    },
    // {
    //     freezeTableName: true,

    //     // define the table's name
    //     tableName: 'activity'
    // }
)

module.exports = Activity