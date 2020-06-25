//Plugin
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('../utils/database');

function controllerLogin(req, res){
    console.log("Transaksi Login : "+req.body.email);
    database.query(
        `SELECT email, no_hp, password FROM pengguna WHERE email=${database.escape(req.body.email)} OR no_hp=${database.escape(req.body.no_hp)};`,
        (err, result) => {
            if(err){
                throw err;
                return res.status(400).send({
                    message: err
                });
            }
            if(!result.length){
                return res.status(401).send({
                    message: "Email atau Nomor Handphone dan Password anda salah!"
                });
            }
            bcrypt.compare(
                req.body.password,
                result[0]['password'],
                (eErr, eResult) => {
                    if(eErr){
                        throw eErr;
                        return res.status(401).send({
                            message: 'Email atau Password anda Salah!'
                        });
                    }
                    if(eResult){
                        //Output Result
                        const user = {
                            idpengguna: result[0].idpengguna,
                            email: result[0].email,
                            nohp: result[0].no_hp
                        };
                        const token = generateToken(user);
                        const refresh_token = jwt.sign({idpengguna:result[0].idpengguna, akses:result[0].akses}, process.env.REFRESH_SECRET, {expiresIn: '7d'})
                        refreshTokens.push(refresh_token)
                        return res.status(200).send({
                            message: 'Anda Berhasil Login',
                            token,
                            refresh_token,
                            user
                        });
                        
                    }
                    return res.status(401).send({
                        message: 'Email atau Password anda Salah!'
                    });
                }
            );
        }
    );
}

function generateToken(user){
    return jwt.sign(user, process.env.ACCESS_SECRET, {expiresIn: '60m'});
}

module.exports = {
    controllerLogin,
    generateToken
}