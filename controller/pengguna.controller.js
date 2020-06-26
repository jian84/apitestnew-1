//Plugin
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('../utils/database');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API);

async function controllerRegistrasi(req, res){
    console.log("Transaksi Registrasi : "+req.body.email);
    try{
        // const token = req.body.token;
        // jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
        //     if(err){
        //         res.sendStatus(401);
        //     }
        // });
        await database.query("START TRANSACTION");
        database.query(
            `SELECT email, no_hp, password FROM pengguna WHERE email=${database.escape(req.body.email)} OR no_hp=${database.escape(req.body.no_hp)};`,
            (err, result) => {
                console.log("yuhuuu"+result.length);
                if(result.length){
                    console.log("Email atau Nomor Handphone yang anda masukkan sudah terdaftar!");
                    return res.status(409).send({
                        message: 'Email atau Nomor Handphone yang anda masukkan sudah terdaftar!'
                    });
                }else{
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if(err){
                            return res.status(500).send({
                                message: err
                            });
                        }else{
                            var auth_token = crypto.createHash('sha1').update(crypto.randomBytes(20)+req.body.email).digest('hex');
                    
                            database.query(
                                `INSERT INTO pengguna (email, no_hp, password, status, notification_token, timestamp, token_mail) VALUES (${database.escape(req.body.email)}, ${database.escape(req.body.no_hp)}, ${database.escape(hash)}, 0, ${database.escape(req.body.notification_token)}, NOW(), ${database.escape(auth_token)});`,
                                (err, result) => {
                                    if (err) {
                                        throw err;
                                        return res.status(400).send({
                                            message: err
                                        });
                                    }
    
                                    var userVerificationURL = 'http://localhost:'+process.env.APP_PORT+'/api/verify_email?token=' + auth_token;
                                    console.log(userVerificationURL);
                                    const message = {
                                        to: req.body.email,
                                        from: 'admin@horang.id',
                                        subject: 'CEK EMAIL',
                                        text: 'Set',
                                        html: '<a target=_blank href=\"' + userVerificationURL + '\">Please confirm your email</a>',
                                    };
                                    sgMail.send(message).then(() => {
                                        console.log('Email Berhasil dikirim ke '+req.body.email)
                                    }).catch((error) => {
                                        console.log(error.response.body)
                                        // console.log(error.response.body.errors[0].message)
                                    })
    
                                    return res.status(201).send({
                                        message: 'Anda Berhasil terdaftar, silahkan konfirmasi email anda terlebih dahulu!'
                                    });
                                }
                            );
                        }
                    });
                }
            }
        );
        await database.query("COMMIT");
    }catch(err){
        await database.query("ROLLBACK");
        console.log("Rollback");
    }
    
}

module.exports= {
    controllerRegistrasi
}