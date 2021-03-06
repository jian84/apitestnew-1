require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataKondisi(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        
        database.query('SELECT idkondisi, kondisi, keterangan, persentase FROM kondisi',
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

async function tambahKondisi(req, res, next){
    if(Object.keys(req.body).length != 4){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let kondisidata = {
                kondisi: req.body.kondisi,
                keterangan: req.body.keterangan,
                persentase: req.body.persentase
            };
            database.beginTransaction(function(err) {
                database.query('INSERT into kondisi set ?', kondisidata, function(err, result){
                    if(err){
                        database.rollback(function(){
                            throw err;
                        });
                    }
                    let logdata = {
                        keterangan : "Tambah Kondisi"+result.insertId,
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
                                });
                            }
                            console.log("Berhasil Menambah Kondisi")
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

async function ubahKondisi(req, res, next){
    if(Object.keys(req.body).length != 5){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let kondisidata = {
                kondisi: req.body.kondisi,
                keterangan: req.body.keterangan,
                persentase: req.body.persentase
            };
            database.beginTransaction(function(err){
                database.query(`UPDATE kondisi set ? where idkondisi= ${database.escape(req.body.idkondisi)}`, kondisidata, function(err, result){
                    if (err){
                        database.rollback(function() {
                            throw err;
                        }); 
                    }
                    let logdata = {
                        keterangan : "Ubah Asuransi"+result.insertId,
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
                            console.log("Berhasil Mengubah Asuransi")
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
    dataKondisi,
    tambahKondisi,
    ubahKondisi   
}