require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataLokasi(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        database.query('SELECT l.idlokasi, l.nama_lokasi, l.keterangan, l.latitude, l.longitude, k.nama_kota from lokasi l, kota k where l.idkota=k.idkota',
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

async function tambahLokasi(req, res, next){
    if(Object.keys(req.body).length != 6){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let lokasidata = {
                nama_lokasi: req.body.nama_lokasi,
                keterangan: req.body.keterangan,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                idkota: req.body.idkota
            };
            database.beginTransaction(function(err){
                database.query('INSERT into lokasi set ?', lokasidata, function(err, result){
                    if(err){
                        database.rollback(function() {
                            throw err;
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
                            console.log("Berhasil Menambah Asuransi")
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

async function ubahLokasi(req, res, next){
    if(Object.keys(req.body).length != 7){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let lokasidata = {
                nama_lokasi: req.body.nama_lokasi,
                keterangan: req.body.keterangan,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                idkota: req.body.idkota
            };
            database.beginTransaction(function(err){
                database.query(`UPDATE lokasi set ? where idlokasi= ${database.escape(req.body.idlokasi)}`, lokasidata, function(err, result){
                    if (err){
                        database.rollback(function() {
                            throw err;
                        }); 
                    }
                    let logdata = {
                        keterangan : "Ubah Lokasi"+result.insertId,
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
                            console.log("Berhasil Mengubah Lokasi")
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
    dataLokasi,
    tambahLokasi,
    ubahLokasi   
}