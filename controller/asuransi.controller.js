require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataAsuransi(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        database.query('SELECT idasuransi, nama_asuransi, perusahaan, alamat, nilai, status, tanggal_kontrak_awal, tanggal_kontrak_akhir FROM asuransi',
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

async function tambahAsuransi(req, res, next){
    if(Object.keys(req.body).length != 8){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let asuransidata = {
                nama_asuransi: req.body.nama_asuransi,
                perusahaan: req.body.perusahaan,
                alamat: req.body.alamat,
                nilai: req.body.nilai,
                status: req.body.status,
                tanggal_kontrak_awal: req.body.tanggal_kontrak_awal,
                tanggal_kontrak_akhir: req.body.tanggal_kontrak_akhir
            };
            database.beginTransaction(function(err){
                database.query('INSERT into asuransi set ?', asuransidata, function(err, result){
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

async function ubahAsuransi(req, res, next){
    if(Object.keys(req.body).length != 9){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let asuransidata = {
                nama_asuransi: req.body.nama_asuransi,
                perusahaan: req.body.perusahaan,
                alamat: req.body.alamat,
                nilai: req.body.nilai,
                status: req.body.status,
                tanggal_kontrak_awal: req.body.tanggal_kontrak_awal,
                tanggal_kontrak_akhir: req.body.tanggal_kontrak_akhir
            };
            database.beginTransaction(function(err){
                database.query(`UPDATE asuransi set ? where idasuransi= ${database.escape(req.body.idasuransi)}`, asuransidata, function(err, result){
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
    dataAsuransi,
    tambahAsuransi,
    ubahAsuransi   
}