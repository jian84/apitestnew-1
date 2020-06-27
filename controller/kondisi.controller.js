require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataKondisi(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        
        database.query('SELECT kondisi, keterangan, presentase FROM kondisi',
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
        return res.status(401).send({
            statuscode:408,
            message: 'Sesi anda tidak valid'
        });
    }
}

async function tambahKondisi(req, res, next){
    try{
        console.log(`Tambah Data Kondisi ${req.body.nama} ${Date.now()}...`);
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        let kondisidata = {
            kondisi:req.body.kondisi,
            keterangan:req.body.keterangan,
            presentase:req.body.presentase
        };
        await database.query("START TRANSACTION");
        await database.query('INSERT into kondisi set ?', kondisidata, function(err, result){
            if (err) throw err;
            // console.log(result.insertId);
        });
        await database.query("COMMIT");
        next();
     }catch(err){
        req.kode = 403;
        next();
        await database.query("ROLLBACK");
        console.log("Rollback");
    }
}

async function ubahKondisi(req, res, next){
    try{
        console.log(`Ubah Data Kondisi ${req.body.kondisi} ${Date.now()}...`);
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        let kondisidata = {
            kondisi:req.body.kondisi,
            keterangan:req.body.keterangan,
            presentase:req.body.presentase
        };
        await database.query("START TRANSACTION");
        await database.query(`UPDATE kondisi set ? where idkondisi= ${database.escape(req.body.idkondisi)}`, kondisidata, function(err, result){
            if (err) throw err;
            console.log("Ubah Data Berhasil!");
        });
        await database.query("COMMIT");
        next();
    }catch(err){
        req.kode = 403;
        next();
await database.query("ROLLBACK");
        console.log("Rollback", err);
    }
}

module.exports = {
    dataKondisi,
    tambahKondisi,
    ubahKondisi   
}