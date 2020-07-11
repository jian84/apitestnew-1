require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataKondisi(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        
        database.query('SELECT idkondisi, kondisi, keterangan, persentase FROM kondisi',
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

async function tambahKondisi(req, res, next){
    if(Object.keys(req.body).length != 4){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let kondisidata = {
                kondisi: req.body.kondisi,
                keterangan: req.body.keterangan,
                persentase: req.body.persentase
            };
            await database.query("START TRANSACTION");
            await database.query('INSERT into kondisi set ?', kondisidata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Tambah Data Kondisi ${req.body.kondisi}...`);
            req.kode = 201;
            next();
        }catch(err){
            await database.query("ROLLBACK");
            req.kode = 401;
            next();
        }
    }
}

async function ubahKondisi(req, res, next){
    if(Object.keys(req.body).length != 5){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
                if(err){
                    res.sendStatus(401);
                }
            });
            let kondisidata = {
                kondisi: req.body.kondisi,
                keterangan: req.body.keterangan,
                persentase: req.body.persentase
            };
            await database.query("START TRANSACTION");
            await database.query(`UPDATE kondisi set ? where idkondisi= ${database.escape(req.body.idkondisi)}`, kondisidata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Ubah Data Kondisi ${req.body.kondisi}...`);
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
    dataKondisi,
    tambahKondisi,
    ubahKondisi   
}