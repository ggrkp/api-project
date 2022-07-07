const { QueryTypes } = require('sequelize');
var Sequelize = require('sequelize');

const Activity = require('../models/activity')
const User = require('../models/user')
const Score = require('../models/score')
const sequelize = require('../database');


exports.getDashboardData = (req, res) => {

    const activitiesPerPerson = sequelize.query(`
    select users.name  as userName ,count(activities.activity_id) as countPerUser
    from users
    left join activities on users.id=activities.userId 
    group by users.id 
    `,

        {
            type: QueryTypes.SELECT
        },
    );



    const activitiesPerMonth = sequelize.query(`
    SELECT MONTH(date) as activityMonth, count(*) as monthlyActivityCount 
    FROM activities  
    GROUP BY MONTH(date)
    `,

        {
            type: QueryTypes.SELECT
        },
    );

    const activitiesPerDay = sequelize.query(`
    SELECT WEEKDAY(date) as weekDay, count(*) as dailyActivityCount FROM activities GROUP BY weekDay
    `,
        {
            type: QueryTypes.SELECT
        },
    );
    const activitiesPerYear = sequelize.query(`
    SELECT YEAR(date) as year, count(*) as yearlyActivityCount FROM activities GROUP BY year
    `,
        {
            type: QueryTypes.SELECT
        },
    );

    const typePercentage = sequelize.query(
        `SELECT 
             COUNT(type) * 100 /(SELECT COUNT(*) FROM activities) as typeCount, type FROM activities GROUP BY type             
            `,

        {
            type: QueryTypes.SELECT
        },

    )


    const monthlyData = new Array(12).fill(0);
    const dailyData = new Array(7).fill(0);
    const typeData = []
    const typeLabels = []


    // Promise.all([activitiesPerPerson, activitiesPerDay, activitiesPerMonth, activitiesPerYear, percentagePerActivity]).then((data) => {


    Promise.all([activitiesPerMonth, activitiesPerPerson, activitiesPerDay, activitiesPerYear, typePercentage, ]).then((data) => {

        // todo: maybe create helper function.
        // monthly activities
        data[0].forEach((activity) => {
            monthlyData[activity.activityMonth - 1] = activity.monthlyActivityCount
        })

        // daily activities
        data[2].forEach((activity) => {
            dailyData[activity.weekDay] = activity.dailyActivityCount
        })

        data[4].forEach(
            item => {
                typeData.push(item.typeCount)
                typeLabels.push(item.type)
            })

        res.send(
            {
                monthlyData,
                perUserData: data[1],
                dailyData,
                yearlyData: data[3],
                typePercentage: { typeData, typeLabels }
            }
        );
    })


}           