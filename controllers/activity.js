const Activity = require('../models/activity')
const User = require('../models/user')
const fs = require("fs");
const fileHelper = require("../utils/file")
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
                        })
                    )
                )
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