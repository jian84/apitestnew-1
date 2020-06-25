require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataKota(req, res){
    try{
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        database.query('SELECT k.nama, k.keterangan, p.nama as provinsi FROM kota k, provinsi p where k.idprovinsi=p.idprovinsi and k.status=1',
        [],
        function(error, rows, field){
            if(error){
                res.send(400).send({
                    message: 'Ada masalah'
                });
            }else{
                res.send(rows);
            }
        });
    }catch(err){
        return res.status(401).send({
            statuscode:408,
            message: 'Sesi anda tidak valid'
        });
    }
}

async function tambahKota(req, res){
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
     }catch(err){
         await database.query("ROLLBACK");
         console.log("Rollback");
    }
}

async function ubahkota(req, res){
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
    }catch(err){
        await database.query("ROLLBACK");
        console.log("Rollback", err);
    }
}

module.exports = {
    dataKota,
    tambahKota,
    ubahkota   
}