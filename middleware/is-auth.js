const jwt = require('jsonwebtoken');

module.exports = () => {
    const token = req.get('Authorization').split(' ')[1];
    let decodedToken
    try{
        decodedToken = jwt.verify(token, 'top-secret-key')
    }
    catch(err){
        err.statusCode = 500
        throw err
    }
    if(!decodedToken){
        new Error('Not authenticated.')
        err.statusCode = 401
        throw err
    }

    req.id = decodedToken.id
    next()
}