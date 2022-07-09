const fs = require("fs");
const { QueryTypes } = require('sequelize');
var Sequelize = require('sequelize');

const Activity = require('../models/activity')
const User = require('../models/user')
const Score = require('../models/score')
const fileHelper = require("../utils/file");
const sequelize = require('../database')
const _ = require('lodash')
const JSONStream = require('JSONStream')

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


// monthly scores for the last 12months
exports.getMonthlyScore = (req, res, next) => {
    const userId = req.userId
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
                        END) *100 AS totalBodyCount,  MONTHNAME(date) as month, MONTH(date) as monthIndex
                    FROM activities
                    WHERE userId = $1  AND (date >= DATE_SUB(CURDATE(),INTERVAL 12 MONTH))
                    GROUP BY month
                    ORDER BY MONTH(date)`, {
        bind: [userId],
        type: QueryTypes.SELECT
    })

    const monthlyTotalActivities = sequelize.query(
        `SELECT COUNT(*) AS totalCount, MONTHNAME(date) as month, MONTH(date) as monthIndex
             FROM activities 
             WHERE userId = $1  AND (date >= DATE_SUB(CURDATE(),INTERVAL 12 MONTH))
              GROUP BY month
              ORDER BY MONTH(date)`, {
        bind: [userId],
        type: QueryTypes.SELECT
    })


    const d = new Date();
    let currMonth = d.getMonth();
    const percentages = new Array(12).fill(0);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    Promise
        .all([monthlyPhysicalActivities, monthlyTotalActivities])
        .then(data => {

            // console.log(data[0]); // monthlyPhysicalActivities
            // console.log(data[1]); // monthlyTotalActivities



            for (let i = 0; i < data[0].length; i++) {

                percentages[data[0][i].monthIndex - 1] = (+(data[0][i].totalBodyCount) / +(data[1][i].totalCount))

                // percentages.push(+(data[0][i].totalBodyCount) / +(data[1][i].totalCount))
                // months[data[0][i].monthIndex - 1] = data[0][i].month
                // months.push(data[0][i].month)
            }

            // * Rotate array to display last 12months from current month.
            for (let i = 0; i < currMonth; i++) {
                percentages.push(percentages.shift())
                months.push(months.shift())
            }

            // console.log(percentages)
            // console.log(months)
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
        .catch((err) => res.status(500).send(err.message));
}


exports.postActivities = (req, res) => {
    const userId = req.userId
    const jsonFile = req.file
    const activityData = []
    var stream = fs.createReadStream(`./uploaded/${req.file.filename}`, { encoding: 'utf8' }),
        parser = JSONStream.parse('locations');

    stream.pipe(parser);

    parser.on('data', function (arr) {
        // console.log(obj); // whatever you will do with each JSON object
        arr
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
                            userId,
                            value: 1
                        }
                        activityData.push(locObj)
                    })
                )

            )
        // console.log(activityData);
        const chunks = _.chunk(activityData, 100)
        const forLoop = async _ => {

            for (let chunk in chunks) {
                // console.log(chunks[chunk])
                Activity.bulkCreate(chunks[chunk]).then(console.log('wow!'))
            }
        }
        forLoop().then(() => {
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
                                WHERE userId = $1
                                AND (date >= DATE_SUB(CURDATE(),INTERVAL 30 DAY))) AS lastMonthScore
                                FROM activities
                                WHERE userId = $1
                                AND (date >= DATE_SUB(CURDATE(),INTERVAL 30 DAY))
                                `,
                {
                    bind: [userId],
                    type: QueryTypes.SELECT
                }
            )
                .then((result) => {
                    let lastMonthScore
                    if (result[0].lastMonthScore === null) {
                        lastMonthScore = 0
                    } else {
                        lastMonthScore = +result[0].lastMonthScore
                    }

                    return (lastMonthScore.toFixed(2));
                }).then(lastMonthScore => {
                    Score
                        .update(
                            { score: lastMonthScore },
                            { where: { userId: userId } }
                        )
                        .then(() => { console.log("score updated") })
                })
        }).then(() => {
            res.status(200).send('done')
        })
    })

}


// exports.postActivities = (req, res, next) => {
//     const userId = req.userId
//     const jsonFile = req.file
//     if (!jsonFile) {
//         res.status(422).send('Error uploading. Invalid file input')
//         res.end();
//         return
//     }
//     // Read the uploaded file.
//     fs.readFile("./uploaded/" + req.file.filename, "utf8", (err, jsonString) => {
//         if (err) {
//             res.status(400).send('File read failed.')
//             return;
//         }
//         try {
//             const activityData = []
//             const fileObject = JSON.parse(jsonString);

//             // Parse the json file and create an array in order to bulk insert records
// fileObject.locations
//     .filter(locItem => locItem.activity !== undefined)
//     .forEach(locItem => locItem.activity
//         .forEach(outerAct => outerAct.activity
//             .forEach(innerAct => {
//                 const locObj = {
//                     type: innerAct.type,
//                     latitude: locItem.latitudeE7 / 10000000,
//                     longtitude: locItem.longitudeE7 / 10000000,
//                     accuracy: locItem.accuracy,
//                     date: locItem.timestamp,
//                     userId
//                 }
//                 activityData.push(locObj)
//             })
//         )

//     )

//             Activity.bulkCreate(activityData)
//                 // After activities are inserted -> update the last months score in the scores table.
//             .then(() => {
//                 sequelize.query(`
//                 SELECT
//                 SUM( CASE 
//                     WHEN 
//                     type='ON_BICYCLE' 
//                     OR 
//                     type='ON_FOOT'
//                                     OR 
//                                     type='RUNNING' 
//                                     OR 
//                                     type='WALKING'  
//                                     THEN    1 
//                                     ELSE    0 
//                                     END)    * 100
//                                     / 
//                                     (SELECT COUNT(*) 
//                                     FROM activities 
//                                     WHERE userId = $1
//                                     AND (date >= DATE_SUB(CURDATE(),INTERVAL 30 DAY))) AS lastMonthScore
//                                     FROM activities
//                                     WHERE userId = $1
//                                     AND (date >= DATE_SUB(CURDATE(),INTERVAL 30 DAY))
//                                     `,
//                     {
//                         bind: [userId],
//                         type: QueryTypes.SELECT
//                     }
//                 )
//                     .then((result) => {
//                         let lastMonthScore
//                         if (result[0].lastMonthScore === null) {
//                             lastMonthScore = 0
//                         } else {
//                             lastMonthScore = +result[0].lastMonthScore
//                         }

//                         return (lastMonthScore.toFixed(2));
//                     }).then(lastMonthScore => {
//                         Score
//                             .update(
//                                 { score: lastMonthScore },
//                                 { where: { userId: userId } }
//                             )
//                             .then(() => { console.log("score updated") })
//                     })
//             })
//             .then(res.status(200).send('success'))
//             .catch((err) => { res.status(400).send('Error uploading!') })
//     }

//     catch (err) {
//         fileHelper.deleteFile("./uploaded/" + req.file.filename)
//         console.log("File read failed:", err)
//         res.status(400).send('Error uploading. Make sure the file is correctly formatted!')
//     }
// })
// }


exports.getLeaders = (req, res) => {
    const userId = +req.userId
    Score.findAll({
        attributes: [
            'score', 'userId',
            [Sequelize.literal('(RANK() OVER (ORDER BY score DESC))'), 'rank']
        ],
        include: [
            {
                model: User, as: 'user',
                attributes: ['name'],
            }

        ]
    })
        .then((result) => {
            console.log('userID' + req.userId)
            res.json({ result, userId })
        })

}

