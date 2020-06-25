require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataPromo(req, res){
    try{
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        database.query('SELECT nama_promo, nominal, keterangan, mulai_promo, akhir_promo FROM promo where status = 1',
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

async function tambahPromo(req, res){
    try{
        console.log(`Tambah Data Promo ${req.body.nama_promo} ${Date.now()}...`);
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        let promodata = {
            nama_promo:req.body.nama_promo,
            nominal:req.body.nominal,
            keterangan:req.body.keterangan,
            mulai_promo:req.body.mulai_promo,
            akhir_promo:req.body.akhir_promo,
            status:req.body.status
        };
        await database.query("START TRANSACTION");
        await database.query('INSERT into promo set ?', promodata, function(err, result){
            if (err) throw err;
            // console.log(result.insertId);
        });
        await database.query("COMMIT");
     }catch(err){
         await database.query("ROLLBACK");
         console.log("Rollback");
    }
}

async function ubahPromo(req, res){
    try{
        console.log(`Ubah Data Promo ${req.body.nama_promo} ${Date.now()}...`);
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        let promodata = {
            nama_promo:req.body.nama_promo,
            nominal:req.body.nominal,
            keterangan:req.body.keterangan,
            mulai_promo:req.body.mulai_promo,
            akhir_promo:req.body.akhir_promo,
            status:req.body.status
        };
        await database.query("START TRANSACTION");
        await database.query(`UPDATE promo set ? where idprovinsi= ${database.escape(req.body.idpromo)}`, promodata, function(err, result){
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
    dataPromo,
    tambahPromo,
    ubahPromo   
}