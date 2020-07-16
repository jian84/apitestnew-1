require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataCustomer(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        database.query('SELECT idcustomer, nama_customer, alamat, noktp FROM customer where blacklist=0',
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

async function tambahCustomer(req, res, next){
    if(Object.keys(req.body).length != 6){
        req.kode = 405;
        next();
    }else{
        try{
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
            await database.query("START TRANSACTION");
            await database.query('INSERT into customer set ?', customerdata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Tambah Data Customer ${req.body.nama}`);
            req.kode = 201;
            next();
        }catch(err){
            await database.query("ROLLBACK");
            req.kode = 401;
            next();
        }
    }
}

async function ubahCustomer(req, res, next){
    if(Object.keys(req.body).length != 8){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let customerdata = {
                nama_customer:req.body.nama_customer,
                alamat:req.body.alamat,
                noktp:req.body.noktp,
                blacklist: req.body.blacklist,
                idkota: req.body.idkota,
                idpengguna: decode.idpengguna
            };
            await database.query("START TRANSACTION");
            await database.query(`UPDATE customer set ? where idcustomer= ${database.escape(req.body.idcustomer)}`, customerdata, function(err, result){
                if (err) throw err;
                console.log("Ubah Data Berhasil!");
            });
            await database.query("COMMIT");
            console.log(`Ubah Data Customer ${req.body.nama}...`);
            req.kode = 200;
            next();
        }catch(err){
            await database.query("ROLLBACK");
            req.kode = 401;
            next();
        }
    }
}

module.exports = {
    dataCustomer,
    tambahCustomer,
    ubahCustomer   
}