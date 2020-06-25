require('dotenv').config()
// const jwt = require('jsonwebtoken');

function validateRegistrasi(req, res, next){
    if(!req.body.email || req.body.email.length < 3){
        return res.status(400).send({
            message: 'Email yang anda masukkan minimum 3 huruf.'
        });
    }
    if(!req.body.password || req.body.password.length < 6){
        return res.status(400).send({
            message: 'Password yang anda masukkan minimum 6 karakter.'
        });
    }
    next();
}

module.exports = {
    validateRegistrasi
};