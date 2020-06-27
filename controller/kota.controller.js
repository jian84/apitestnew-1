require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataKota(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        database.query('SELECT k.nama, k.keterangan, p.nama as provinsi FROM kota k, provinsi p where k.idprovinsi=p.idprovinsi and k.status=1',
        [],
        function(error, rows, field){
            if(error){
                req.kode = 400;
                req.message = "Sorry, something went wrong";
                next();
            }else{
                req.kode = 201;
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
    try{
        console.log(`Tambah Data Kota ${req.body.nama} ${Date.now()}...`);
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        let kotadata = {
            nama:req.body.nama,
            keterangan:req.body.keterangan,
            status:req.body.status,
            idprovinsi: req.body.idprovinsi
        };
        await database.query("START TRANSACTION");
        await database.query('INSERT into kota set ?', kotadata, function(err, result){
            if (err) throw err;
            // console.log(result.insertId);
        });
        await database.query("COMMIT");
        req.kode=201;
        next();
     }catch(err){
         await database.query("ROLLBACK");
         console.log("Rollback");
         next();
    }
}

async function ubahkota(req, res, next){
    try{
        console.log(`Ubah Data Kota ${req.body.nama} ${Date.now()}...`);
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        let kotadata = {
            nama:req.body.nama,
            keterangan:req.body.keterangan,
            status:req.body.status,
            idprovinsi: req.body.idprovinsi
        };
        await database.query("START TRANSACTION");
        await database.query(`UPDATE kota set ? where idkota= ${database.escape(req.body.idkota)}`, kotadata, function(err, result){
            if (err) throw err;
            console.log("Ubah Data Berhasil!");
        });
        await database.query("COMMIT");
        req.kode = 201;
        next();
    }catch(err){
        await database.query("ROLLBACK");
        console.log("Rollback", err);
        next();
    }
}

module.exports = {
    dataKota,
    tambahKota,
    ubahkota   
}