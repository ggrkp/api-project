const Sequelize = require('sequelize');

const sequelize = require('../database')

const Activity = sequelize.define('activity',
    {
        //  type date latitude longtitude accuracy user_id activity_id
        activity_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        user_id: {
            type: Sequelize.BIGINT(20),
            allowNull: false,
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