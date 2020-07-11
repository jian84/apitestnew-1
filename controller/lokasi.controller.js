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

async function tambahLokasi(req, res, next){
    if(Object.keys(req.body).length != 6){
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
            await database.query("START TRANSACTION");
            await database.query('INSERT into lokasi set ?', lokasidata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Tambah Data Lokasi ${req.body.nama_lokasi}...`);
            req.kode = 201;
            next();
        }catch(err){
            await database.query("ROLLBACK");
            req.kode = 401;
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
            await database.query("START TRANSACTION");
            await database.query(`UPDATE lokasi set ? where idlokasi= ${database.escape(req.body.idlokasi)}`, lokasidata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Ubah Data Lokasi ${req.body.nama_lokasi}...`);
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
    dataLokasi,
    tambahLokasi,
    ubahLokasi   
}