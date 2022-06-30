const Activity = require('../models/activity')
const User = require('../models/user')
const fs = require("fs");
const fileHelper = require("../utils/file");
const e = require('express');
const sequelize = require('../database');
const { QueryTypes } = require('sequelize');

exports.getTotalScore = (req, res, next) => {
    const userId = req.userId
    sequelize.query(`
        SELECT
            SUM( CASE 
                    WHEN 
                        type='ON_BICYCLE' 
                        OR 
                        type='ON_FOOT'
                        OR 
                        type='RUNNING' 
                        OR 
                        type='WALKING'  
                    THEN    1 
                    ELSE    0 
                    END)    * 100
                    / 
                    (SELECT COUNT(*) 
                        FROM activities 
                        WHERE userId = $1) AS totalScore
            FROM activities
            WHERE userId = $1
         `,
        {
            bind: [userId],
            type: QueryTypes.SELECT
        },
    ).then(records => {
        console.log(userId)
        console.log(JSON.stringify(records[0], null, 2))
        res.json(records[0])
    })
}


exports.getMonthlyScore = (req, res, next) => {
    const monthlyPhysicalActivities = sequelize.query(`
              SELECT
                SUM( CASE 
                        WHEN 
                            type='ON_BICYCLE' 
                            OR 
                            type='ON_FOOT'
                            OR 
                            type='RUNNING' 
                            OR 
                            type='WALKING'  
                        THEN    1 
                        ELSE    0 
                        END) *100 AS totalBodyCount,  MONTHNAME(date) as month
                    FROM activities
                    WHERE userId = $1  AND (date >= DATE_SUB(CURDATE(),INTERVAL 12 MONTH))
                    GROUP BY month
                    ORDER BY MONTH(date)`, {
        bind: [1, 2],
        type: QueryTypes.SELECT
    })

    const monthlyTotalActivities = sequelize.query(
        `SELECT COUNT(*) AS totalCount, MONTHNAME(date) as month
             FROM activities 
             WHERE userId = $1  AND (date >= DATE_SUB(CURDATE(),INTERVAL 12 MONTH))
              GROUP BY month
              ORDER BY MONTH(date)`, {
        bind: [1],
        type: QueryTypes.SELECT
    })

    Promise
        .all([monthlyPhysicalActivities, monthlyTotalActivities])
        .then(responses => {
            console.log('**********COMPLETE RESULTS****************');

            console.log(responses[0]); // monthlyPhysicalActivities
            console.log(responses[1]); // monthlyTotalActivities


            const percentages = []
            const months = []

            for (let i = 0; i < responses[0].length; i++) {
                console.log(responses[0][i].totalBodyCount)
                percentages.push(+(responses[0][i].totalBodyCount) / +(responses[1][i].totalCount))
                months.push(responses[0][i].month)
            }
            console.log(percentages)
            console.log(months)
            const totalResponse = { percentages, months }
            res.send(totalResponse)
        })

        .catch(err => {
            console.log('**********ERROR RESULT****************');
            console.log(err);
        });
}



exports.getRecordsRange = (req, res, next) => {
    const userId = req.userId
    sequelize.query(`
    SELECT
        MIN(date) as oldestDate,
        MAX(date) as latestDate
    FROM activities
    WHERE userId = $1
    `,
        {
            bind: [userId],
            type: QueryTypes.SELECT
        },
    ).then(records => {
        console.log(userId)
        console.log(JSON.stringify(records[0], null, 2))
        res.json(records[0])
    })
}


exports.getLatestUpload = (req, res, next) => {
    const userId = req.userId
    Activity.findOne({
        where: { userId: userId },
        order: [['createdAt', 'DESC']],
    })
        .then(activity => res.status(200).send(activity.createdAt))
        .catch((err) => res.status(500).send('There are no records in the database.'));
}


exports.postActivities = (req, res, next) => {
    const userId = req.userId
    const jsonFile = req.file
    if (!jsonFile) {
        res.status(422).send('Error uploading. Invalid file input')
        res.end();
        return
    }
    fs.readFile("./uploaded/" + req.file.filename, "utf8", (err, jsonString) => {
        if (err) {
            res.status(400).send('File read failed.')
            return;
        }
        try {
            const activityData = []
            const fileObject = JSON.parse(jsonString);
            fileObject.locations
                .filter(locItem => locItem.activity !== undefined)
                .forEach(locItem => locItem.activity
                    .forEach(outerAct => outerAct.activity
                        .forEach(innerAct => {
                            const locObj = {
                                type: innerAct.type,
                                latitude: locItem.latitudeE7 / 10000000,
                                longtitude: locItem.longitudeE7 / 10000000,
                                accuracy: locItem.accuracy,
                                date: locItem.timestamp,
                                userId
                            }
                            activityData.push(locObj)
                            console.log("hello")
                        })
                    )

                )
            console.log("finished for each")

            Activity.bulkCreate(activityData)
                .then(
                    res.status(200).send('success')
                )
                .catch((err) => { res.status(400).send('Error uploading!') })
        }

        catch (err) {
            fileHelper.deleteFile("./uploaded/" + req.file.filename)
            console.log("File read failed:", err)
            res.status(400).send('Error uploading. Make sure the file is correctly formatted!')
        }
    })
}

