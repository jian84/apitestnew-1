require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataSetting(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        database.query('SELECT * FROM setting',
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

async function tambahSetting(req, res, next){
    if(Object.keys(req.body).length != 4){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let settingdata = {
                key:req.body.kode_voucher,
                value:req.body.jumlah_voucher,
                keterangan:req.body.persentase,
                status:req.body.nominal
            };
            database.beginTransaction(function(err){
                database.query('INSERT into setting set ?', settingdata, function(err, result){
                    if(err){
                        database.rollback(function() {
                            throw err;
                        });    
                    }
                    let logdata = {
                        keterangan : "Tambah Setting",
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
                            console.log("Berhasil Menambah Setting")
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

async function ubahSetting(req, res, next){
    if(Object.keys(req.body).length != 5){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let settingdata = {
                key:req.body.kode_voucher,
                value:req.body.jumlah_voucher,
                keterangan:req.body.persentase,
                status:req.body.nominal
            };
            database.beginTransaction(function(err){
                database.query(`UPDATE setting set ? where idsetting= ${database.escape(req.body.idsetting)}`, settingdata, function(err, result){
                    if (err){
                        database.rollback(function() {
                            throw err;
                        }); 
                    }
                    let logdata = {
                        keterangan : "Ubah Setting"+result.insertId,
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
                            console.log("Berhasil Mengubah Setting")
                            database.end();
                            req.kode=200;
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

module.exports = {
    dataSetting,
    tambahSetting,
    ubahSetting 
}