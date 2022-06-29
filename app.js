const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const sequelize = require('./database');
const cookieParser = require('cookie-parser')
const User = require('./models/user')
const Activity = require('./models/activity')
const jwt = require('jsonwebtoken');
const multer = require('multer')

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploaded')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/json') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(multer({
    storage: fileStorage,
    fileFilter
}).single('file'))

app.use(bodyParser.json());


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

// * Set relationship between user and activity. *
Activity.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Activity)

sequelize
    // .sync({ force: true })
    .sync()
    .then(result => {
        app.listen(3000, () => {
            console.log("Database connection is Ready and "
                + "Server is Listening on Port ", 3000);
        })
    })
    .catch(err => {
        connsole.log(err.message)
        return res.status(400).send({
            message: err.message
        })
    })