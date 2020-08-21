require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

async function tambahProduk(req, res, next){
    if(Object.keys(req.body).length != 9){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let produkData = {
                idjenis_produk: req.body.idjenis_produk,
                idlokasi: req.body.idlokasi,
                kode_kontainer: req.body.kode_kontainer,
                keterangan: req.body.keterangan,
                gambar: req.body.gambar,
                harga: req.body.harga,
                iddevice: req.body.iddevice,
                idkondisi: req.body.idkondisi,
                status: req.body.status
            };
            database.beginTransaction(function(err){
                database.query('INSERT into produk set ?', produkData, function(err, result){
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
            req.kode = 403;
            next();
        }
    }
}

async function ubahProduk(req, res, next){
    if(Object.keys(req.body).length != 10){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let produkData = {
                idjenis_produk: req.body.idjenis_produk,
                idlokasi: req.body.idlokasi,
                kode_kontainer: req.body.kode_kontainer,
                keterangan: req.body.keterangan,
                gambar: req.body.gambar,
                harga: req.body.harga,
                iddevice: req.body.iddevice,
                idkondisi: req.body.idkondisi,
                status: req.body.status,
                edited: Date.now()
            };
            database.beginTransaction(function(err){
                database.query(`UPDATE produk set ? where idproduk= ${database.escape(req.body.idproduk)}`, produkData, function(err, result){
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
    tambahProduk,
    ubahProduk   
}