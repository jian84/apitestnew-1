require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataAllCustomer(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        database.query('SELECT idcustomer, nama_customer, alamat, noktp, nama_kota, customer.idkota, blacklist FROM customer, kota where customer.idkota=kota.idkota',
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

function dataCustomerCustom(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        database.query('SELECT idcustomer, nama_customer, alamat, noktp, nama_kota, customer.idkota, blacklist FROM customer, kota where customer.idkota=kota.idkota and blacklist=0 and customer.idpengguna=?',
        [decode.idpengguna],
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

async function tambahCustomer(req, res, next){
    if(Object.keys(req.body).length != 6){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let customerdata = {
                nama_customer: req.body.nama_customer,
                alamat: req.body.alamat,
                noktp: req.body.noktp,
                blacklist: req.body.blacklist,
                idkota: req.body.idkota,
                idpengguna: decode.idpengguna
            };
            database.beginTransaction(function(err){
                database.query('INSERT into customer set ?', customerdata, function(err){
                    if(err){
                        database.rollback(function() {
                            throw err;
                        });    
                    }
                    let logdata = {
                        keterangan : "Tambah Customer",
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
                            console.log("Berhasil Menambah Customer")
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

async function ubahCustomer(req, res, next){
    if(Object.keys(req.body).length != 6){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let customerdata = {
                nama_customer:req.body.nama_customer,
                alamat:req.body.alamat,
                noktp:req.body.noktp,
                blacklist: req.body.blacklist,
                idkota: req.body.idkota
            };
            database.beginTransaction(function(err){
                database.query('SET SQL_SAFE_UPDATES = 0;UPDATE customer SET ? WHERE idpengguna=${decode.idpengguna}', customerdata, function(err, result) {
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

module.exports = {
    dataAllCustomer,
    dataCustomerCustom,
    tambahCustomer,
    ubahCustomer   
}