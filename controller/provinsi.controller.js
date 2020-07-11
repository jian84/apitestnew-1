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
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let provinsidata = {
                nama_provinsi:req.body.nama_provinsi,
                keterangan:req.body.keterangan,
                status:req.body.status
            };
            await database.query("START TRANSACTION");
            await database.query('INSERT into provinsi set ?', provinsidata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Tambah Data Provinsi ${req.body.nama_provinsi}...`);
            req.kode = 201;
            next();
         }catch(err){
            await database.query("ROLLBACK");
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
            await database.query("START TRANSACTION");
            await database.query(`UPDATE provinsi set ? where idprovinsi= ${database.escape(req.body.idprovinsi)}`, provinsidata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Ubah Data Provinsi ${req.body.nama}...`);
            req.kode = 200;
            next();
        }catch(err){
            await database.query("ROLLBACK");
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