const Activity = require('../models/activity')
const User = require('../models/user')
exports.addActivities = (req, res, next) => {
     
    const userId = req.userId

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