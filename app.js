const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const sequelize = require('./database');

const User = require('./models/user')
const Activity = require('./models/activity')

const app = express();
var cors = require('cors');
// use it before all route definitions
app.use(cors())
// app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());


const userRoutes = require('./routes/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')))

app.use(userRoutes);

sequelize.sync()
    .then(result => {
        app.listen(3000, () => {
            console.log("Database connection is Ready and "
                + "Server is Listening on Port ", 3000);
        })
    })
    .catch(err => console.error(err))