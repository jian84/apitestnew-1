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

async function Registrasi(req, res){
    console.log("Transaksi Registrasi : "+req.body.email);
    database.query(
        `SELECT email, no_hp, password FROM pengguna WHERE email=${database.escape(req.body.email)} OR no_hp=${database.escape(req.body.no_hp)};`,
        (err, result) => {
            console.log("yuhuuu"+result.length);
            if(result.length){
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
                            `INSERT INTO pengguna (email, no_hp, password, status, notification_token, timestamp, token_mail) VALUES (${database.escape(req.body.email)}, ${database.escape(req.body.no_hp)}, ${database.escape(hash)}, ${database.escape(req.body.status)}, ${database.escape(req.body.notification_token)}, NOW(), ${database.escape(auth_token)});`,
                            (err, result) => {
                                if (err) {
                                    throw err;
                                    return res.status(400).send({
                                        message: err
                                    });
                                }
                                var userVerificationURL = 'http://' + process.env.DB_HOST + ':'+process.env.APP_PORT+'/api/verify_email?token=' + auth_token;
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
}

async function ubahPengguna(req, res, next){
    if(Object.keys(req.body).length != 5){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode=401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let penggunadata = {
                email:req.body.email,
                no_hp:req.body.no_hp,
                password:req.body.password,
                status : req.body.status,
                notification_token: req.body.notification_token, 
                token_mail: req.body.token_mail,
                foto: req.body.foto,
                tipe: req.body.tipe, 
                pin: req.body.pin
            };
            database.beginTransaction(function(err){
                database.query(`UPDATE pengguna set ? where idpengguna= ${decode.idpengguna}`, penggunadata, function(err, result){
                    if (err){
                        database.rollback(function() {
                            throw err;
                        }); 
                    }
                    let logdata = {
                        keterangan : "Ubah Pengguna"+result.insertId,
                        idpengguna: decode.idpengguna
                    }
                    database.query('INSERT INTO log_aktifitas set ?', logdata, function(err, result){
                        if(err){
                            database.rollback(function(){
                                throw err;
                            });
                        }
                        database.commit(function(err){
                            if(err){
                                console.log("Error Commit")
                                database.rollback(function(){
                                    throw err;
                                })
                            }
                            console.log("Berhasil Mengubah Pengguna")
                            database.end();
                            req.kode=200;
                            next();
                        });
                    });
                });
            });
        }catch(err){
            req.kode = 403;
            next();
        }
    }
}

async function insertPin(req, res, next){
    if(Object.keys(req.body).length != 5){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode=401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let pindata = {
                pin:req.body.pin
            };
            database.beginTransaction(function(err){
                database.query(`UPDATE pengguna set ? where idpengguna= ${decode.idpengguna}`, pindata, function(err, result){
                    if(err){
                        database.rollback(function() {
                            throw err;
                        });    
                    }
                    let logdata = {
                        keterangan : "Tambah Pin",
                        idpengguna: decode.idpengguna
                    }
                    database.query('INSERT INTO log_aktifitas set ?', logdata, function(err, result){
                        if(err){
                            database.rollback(function(){
                                throw err;
                            });       
                        }
                        database.commit(function(err){
                            if(err){
                                console.log("Error Commit")
                                database.rollback(function(){
                                    throw err;
                                })
                            }
                            console.log("Berhasil Menambah Pin")
                            database.end();
                            req.kode=201;                   
                            next();
                        });
                    });
                });
            });
        }catch(err){
            req.kode = 403;
            next();
        }
    }
}

async function insertPassword(req, res, next){
    if(Object.keys(req.body).length != 5){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let pindata = {
                password:req.body.password
            };
            req.kode=401;
            database.beginTransaction(function(err){
                database.query(`UPDATE pengguna set ? where idpengguna= ${decode.idpengguna}`, pindata, function(err, result){
                    if(err){
                        database.rollback(function() {
                            throw err;
                        });    
                    }
                    let logdata = {
                        keterangan : "Tambah Password",
                        idpengguna: decode.idpengguna
                    }
                    database.query('INSERT INTO log_aktifitas set ?', logdata, function(err, result){
                        if(err){
                            database.rollback(function(){
                                throw err;
                            });       
                        }
                        database.commit(function(err){
                            if(err){
                                console.log("Error Commit")
                                database.rollback(function(){
                                    throw err;
                                })
                            }
                            console.log("Berhasil Menambah Password")
                            database.end();
                            req.kode=201;                   
                            next();
                        });
                    });
                });
            });
        }catch(err){
            req.kode = 403;
            next();
        }
    }
}

async function ubahPin(req, res, next){
    console.log(req.body);
    console.log(Object.keys(req.body).length);
        if(Object.keys(req.body).length != 3){
            req.kode = 405;
            next();
        }else{
            try{
                const token = req.body.token;
                const decode = jwt.verify(token, process.env.ACCESS_SECRET);
                req.kode=401;
                database.beginTransaction(function(err){
                    if(err){
                        throw err;
                    }
                    database.query(`SELECT password FROM pengguna where pin=${req.body.pinlama}`, (err, result) =>{
                        if(result.length==0){
                            return res.status(405).send({
                                message: 'Pin anda masukkan tidak valid'
                            });
                        }else{
                            database.query(`UPDATE pengguna set pin=${req.body.pinbaru} where idpengguna= ${decode.idpengguna}`, function(err, result){
                                if (err) { 
                                    console.log("Update Data Pin Error");
                                    database.rollback(function() {
                                        throw err;
                                    });
                                }
                            });        
                        }
                        let logdata = {
                            keterangan : "Tambah Asuransi",
                            idpengguna: decode.idpengguna
                        }
                        database.query('INSERT INTO log_aktifitas set ?', logdata, function(err, result){
                            if(err){
                                database.rollback(function(){
                                    throw err;
                                });       
                            }
                            database.commit(function(err){
                                if(err){
                                    console.log("Error Commit")
                                    database.rollback(function(){
                                        throw err;
                                    })
                                }
                                console.log("Berhasil Update Pin")
                                database.end();
                                req.kode=201;                   
                                next();
                            });
                        });
                    });
                });
            }catch(err){
                req.kode = 403;
                next();
            }
        }
    }

    async function ubahPassword(req, res, next){
        if(Object.keys(req.body).length != 3){
            req.kode = 405;
            next();
        }else{
            try{
                const token = req.body.token;
                const decode = jwt.verify(token, process.env.ACCESS_SECRET);
                req.kode=401;
                database.beginTransaction(function(err){
                    if(err){
                        throw err;
                    }
                    database.query(`SELECT password FROM pengguna where idpengguna=${decode.idpengguna}`, (err, result) =>{
                        if(result.length==0){
                            return res.status(401).send({
                                message: 'User anda tidak valid'
                            });
                        }else{
                            bcrypt.compare(
                                req.body.passwordlama,
                                result[0]['password'],
                                (eErr, eResult) => {
                                    if(eErr){
                                        throw eErr;
                                    }else{
                                        database.query(`UPDATE pengguna set password=${req.body.passwordbaru} where idpengguna= ${decode.idpengguna}`, function(err, result){
                                            if (err) { 
                                                console.log("Update Data Password Error");
                                                database.rollback(function() {
                                                    throw err;
                                                });
                                            }
                                        });  
                                    }
                                }
                            );      
                        }
                        database.commit(function(err){
                            if(err){
                                console.log("Error Commit")
                                database.rollback(function(){
                                    throw err;
                                })
                            }
                            console.log("Berhasil Update Password")
                            database.end();
                            req.kode=201;                   
                            next();
                        });
                    });
                });
            }catch(err){
                req.kode = 403;
                next();
            }
        }
    }


module.exports= {
    Registrasi,
    ubahPengguna,
    insertPin,
    insertPassword,
    ubahPin,
    ubahPassword
}