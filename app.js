const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const sequelize = require('./database');
const cookieParser = require('cookie-parser')
const User = require('./models/user')
const Activity = require('./models/activity')
var { expressjwt: jwt } = require("express-jwt");
const app = express();

app.use(bodyParser.json());


// ! custom getToken function which will look for the token on an incoming cookie
app.use(cookieParser());

app.use(
    jwt({
        secret: 'top_secret_key',
        getToken: req => req.cookies.token,
        algorithms: ['HS256']
    }).unless({ path: ["/api/login"] })
);



app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, DELETE, OPTIONS, PUT, PATCH')
    res.setHeader('Access-Control-Allow-Headers',
        'Content-Type, Authorization')
    next()
})

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message
    const data = error.data
    res.status(status).json({ message: message, data: data })
})

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