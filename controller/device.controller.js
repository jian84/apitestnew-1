require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataDevice(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        database.query('SELECT iddevice, kode_device, serial_device, hardware_id, ipaddress FROM device',
        [],
        function(error, rows, field){
            if(error){
                req.kode = 204;
                next();
            }else{
                req.kode = 200;
                req.data = rows;
                next();
            }
        });
    }catch(err){
        req.kode = 403;
        next();
    }
}

async function tambahDevice(req, res, next){
    if(Object.keys(req.body).length != 5){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let devicedata = {
                kode_device: req.body.kode_device,
                serial_device: req.body.serial_device,
                hardware_id: req.body.hardware_id,
                ipaddress: req.body.ipaddress
            };
            database.beginTransaction(function(err){
                database.query('INSERT into device set ?', devicedata, function(err, result){
                    if (err){
                        database.rollback(function(){
                            throw err;
                        });
                    }
                    let logdata = {
                        keterangan : "Tambah Device",
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
                            console.log("Berhasil Menambah Device")
                            database.end();
                            req.kode=201;                   
                            next()
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

async function ubahDevice(req, res, next){
    if(Object.keys(req.body).length != 6){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let devicedata = {
                kode_device: req.body.kode_device,
                serial_device: req.body.serial_device,
                hardware_id: req.body.hardware_id,
                ipaddress: req.body.ipaddress
            };
            database.beginTransaction(function(err){
                database.query(`UPDATE device set ? where iddevice= ${database.escape(req.body.iddevice)}`, devicedata, function(err, result){
                    if (err){
                        database.rollback(function() {
                            throw err;
                        });  
                    }
                    let logdata = {
                        keterangan : "Ubah Device :"+result.insertId,
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
                            console.log("Berhasil Mengubah Device")
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

module.exports = {
    dataDevice,
    tambahDevice,
    ubahDevice   
}