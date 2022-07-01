const Sequelize = require('sequelize');

const sequelize = require('../database')

const Score = sequelize.define('scores',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        score: {
            type: Sequelize.FLOAT
        },
    },
    {
        // define the table's name
        freezeTableName: true,
        tableName: 'scores'
    }
)

module.exports = Score