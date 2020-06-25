require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataProvinsi(req, res){
    try{
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        database.query('SELECT nama, keterangan, status FROM provinsi',
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

async function tambahProvinsi(req, res){
    try{
        console.log(`Tambah Data Provinsi ${req.body.nama} ${Date.now()}...`);
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        let provinsidata = {
            nama:req.body.nama,
            keterangan:req.body.keterangan,
            status:req.body.status
        };
        await database.query("START TRANSACTION");
        await database.query('INSERT into provinsi set ?', provinsidata, function(err, result){
            if (err) throw err;
            // console.log(result.insertId);
        });
        await database.query("COMMIT");
     }catch(err){
         await database.query("ROLLBACK");
         console.log("Rollback");
    }
}

async function ubahProvinsi(req, res){
    try{
        console.log(`Ubah Data Provinsi ${req.body.nama} ${Date.now()}...`);
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        let provinsidata = {
            nama:req.body.nama,
            keterangan:req.body.keterangan,
            status:req.body.status
        };
        await database.query("START TRANSACTION");
        await database.query(`UPDATE provinsi set ? where idprovinsi= ${database.escape(req.body.idprovinsi)}`, provinsidata, function(err, result){
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
    dataProvinsi,
    tambahProvinsi,
    ubahProvinsi   
}