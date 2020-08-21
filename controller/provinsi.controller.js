require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataProvinsi(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRE);
        database.query('SELECT idprovinsi, nama_provinsi, keterangan, status FROM provinsi',
        [],
        function(error, rows, field){
            if(error){
                req.kode = 204;
                next();
            }else{
                req.kode = 202;
                req.data = rows;
                next();
            }
        });
    }catch(err){
        req.kode = 403;
        next();
    }
}

async function tambahProvinsi(req, res, next){
    if(Object.keys(req.body).length != 4){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode=401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let provinsidata = {
                nama_provinsi:req.body.nama_provinsi,
                keterangan:req.body.keterangan,
                status:req.body.status
            };
            database.beginTransaction(function(err){
                database.query('INSERT into provinsi set ?', provinsidata, function(err, result){
                    if(err){
                        database.rollback(function() {
                            throw err;
                        });    
                    }
                    let logdata = {
                        keterangan : "Tambah Produk",
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
                            console.log("Berhasil Menambah Produk")
                            database.end();
                            req.kode=201;                   
                            next();
                        });
                    });
                });
            });
         }catch(err){
            req.kode = 401;
            next();
        }
    }
}

async function ubahProvinsi(req, res, next){
    if(Object.keys(req.body).length != 5){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let provinsidata = {
                nama_provinsi:req.body.nama_provinsi,
                keterangan:req.body.keterangan,
                status:req.body.status
            };
            req.kode=401;
            database.beginTransaction(function(err){
                database.query(`UPDATE provinsi set ? where idprovinsi= ${database.escape(req.body.idprovinsi)}`, provinsidata, function(err, result){
                    if (err){
                        database.rollback(function() {
                            throw err;
                        }); 
                    }
                    let logdata = {
                        keterangan : "Ubah Produk"+result.insertId,
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
                            console.log("Berhasil Mengubah Produk")
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
    dataProvinsi,
    tambahProvinsi,
    ubahProvinsi   
}