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
        `SELECT p.idpengguna, p.email, p.no_hp, p.password, IFNULL(c.idcustomer, 0) as idcustomer, IFNULL(c.nama_customer, 0) as nama_customer FROM pengguna p LEFT JOIN customer c ON p.idpengguna = c.idpengguna WHERE p.email=${database.escape(req.body.email)} OR p.no_hp=${database.escape(req.body.no_hp)} ;`,
        (err, result) => {
            if(err){
                throw err;
            }
            if(!result.length){
                return res.status(401).send({
                    message: "Email atau Nomor Handphone dan Password anda salah!"
                });
            }else{
                database.query(`SELECT idpengguna, email, no_hp, password FROM pengguna WHERE status=1;`,
                (err, result) => {
                    if(err){
                        throw err;
                        return res.send(400);
                    }
                });
                if(!result.length){
                    return res.status(401).send({
                        message: "Mohon Verifikasi email terlebih dahulu"
                    });
                }else{
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
                                    idpengguna: result[0].idpengguna
                                };
                                const access_token = generateToken(user);
                                // const refresh_token = jwt.sign({idpengguna:result[0].idpengguna, akses:result[0].akses}, process.env.REFRESH_SECRET, {expiresIn: '7d'})
                                const refresh_token = jwt.sign(user, process.env.REFRESH_SECRET, {expiresIn: '7d'})
                                refreshTokens.push(refresh_token)
                                return res.status(200).send({
                                    message: 'Anda Berhasil Login',
                                    access_token,
                                    refresh_token,
                                    email: result[0].email,
                                    idcustomer: result[0].idcustomer,
                                    nama_customer: result[0].nama_customer
                                });
                                
                            }
                            return res.status(401).send({
                                message: 'Email atau Password anda Salah!'
                            });
                        }
                    );
                }
            }
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