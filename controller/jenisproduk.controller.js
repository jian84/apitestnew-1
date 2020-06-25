require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataJenisProduk(req, res){
    try{
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        database.query('SELECT nama, keterangan, gambar FROM jenis_produk',
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

async function tambahJenisProduk(req, res){
    // const connection = await mysql.connection();
    try{
        console.log(`Tambah Data Jenis Produk ${req.body.nama} ${Date.now()}...`);
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        let jenisprodukdata = {
            keterangan:req.body.keterangan,
            nama:req.body.nama,
            gambar:req.body.gambar
        };
        await database.query("START TRANSACTION");
        await database.query('INSERT into jenis_produk set ?', jenisprodukdata, function(err, result){
            if (err) throw err;
            // console.log(result.insertId);
        });
        await database.query("COMMIT");
     }catch(err){
         await database.query("ROLLBACK");
         console.log("Rollback");
    }
}

async function ubahJenisProduk(req, res){
    try{
        console.log(`Ubah Data Jenis Produk ${req.body.nama} ${Date.now()}...`);
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        let jenisprodukdata = {
            keterangan:req.body.keterangan,
            nama:req.body.nama,
            gambar:req.body.gambar
        };
        await database.query("START TRANSACTION");
        await database.query(`UPDATE jenis_produk set ? where idjenis_produk= ${database.escape(req.body.idjenis_produk)}`, jenisprodukdata, function(err, result){
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
    dataJenisProduk,
    tambahJenisProduk,
    ubahJenisProduk   
}