const Activity = require('../models/activity')
const User = require('../models/user')
const fs = require("fs");

exports.getFile = (req, res, next) => {
    const userId = req.userId
    const jsonFile = req.file
    if (!jsonFile) {
        res.status(422)
        res.error('Invalid file input.')
        res.end()
    }
    fs.readFile("./uploaded/" + req.file.filename, "utf8", (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err);
            return;
        }
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
                        // con.query(`INSERT INTO activity (type, date, latitude, longtitude, accuracy, user_id) VALUES ("${locObj.activity}","${locObj.timestamp}","${locObj.lat}","${locObj.lon}","${locObj.accuracy}","${locObj.id}")`, function (err, result, fields) {
                        //     // res.json(result);
                        //     console.log(err)
                        // });
                    })
                )
            )
        console.log(activityData[0])
        Activity.bulkCreate(activityData)
            .then(res.end('success'))
            .catch((err) => { console.error(err) })
    })
}

exports.addActivities = (req, res, next) => {


    const type = req.body.type
    const latitude = req.body.latitude
    const longtitude = req.body.longtitude
    const accuracy = req.body.accuracy
    const date = req.body.date

    // User.findByPk(req.userId).then((user) => {
    //     user.createActivity({
    //         type: type,
    //         latitude: latitude,
    //         longtitude: longtitude,
    //         accuracy: accuracy,
    //         date: date
    //     }).then(res.end('success'))
    //         .catch((err) => { console.error(err) })
    // })

    Activity.bulkCreate([
        {
            type: type,
            latitude: latitude,
            longtitude: longtitude,
            accuracy: accuracy,
            date: date,
            userId
        },
        {
            type: 'ON_FOOT',
            latitude: latitude,
            longtitude: longtitude,
            accuracy: accuracy,
            date: date,
            userId
        }])
        .then(res.end('success'))
        .catch((err) => { console.error(err) })
}   