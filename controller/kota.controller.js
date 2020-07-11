require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataKota(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        database.query('SELECT k.idkota, k.nama_kota, k.keterangan, p.nama_provinsi as provinsi FROM kota k, provinsi p where k.idprovinsi=p.idprovinsi and k.status=1',
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

async function tambahKota(req, res, next){
    if(Object.keys(req.body).length != 5){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let kotadata = {
                nama_kota: req.body.nama_kota,
                keterangan: req.body.keterangan,
                status: req.body.status,
                idprovinsi: req.body.idprovinsi
            };
            await database.query("START TRANSACTION");
            await database.query('INSERT into kota set ?', kotadata, function(err, result){
                if (err) throw err;
                // console.log(result.insertId);
            });
            await database.query("COMMIT");
            console.log(`Tambah Data Kota ${req.body.nama_kota}...`);
            req.kode=201;
            next();
         }catch(err){
            await database.query("ROLLBACK");
            req.kode = 401;
            next();
        }
    }
}

async function ubahkota(req, res, next){
    if(Object.keys(req.body).length != 6){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let kotadata = {
                nama_kota: req.body.nama_kota,
                keterangan: req.body.keterangan,
                status: req.body.status,
                idprovinsi: req.body.idprovinsi
            };
            await database.query("START TRANSACTION");
            await database.query(`UPDATE kota set ? where idkota= ${database.escape(req.body.idkota)}`, kotadata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Ubah Data Kota ${req.body.nama_kota}...`);
            req.kode = 200;
            next();
        }catch(err){
            await database.query("ROLLBACK");
            console.log("Rollback", err);
            next();
        }
    }
}

module.exports = {
    dataKota,
    tambahKota,
    ubahkota   
}