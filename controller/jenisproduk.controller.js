require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataJenisProduk(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        console.log(decode.idpengguna);
        // req.dataPengguna = decode;
        database.query('SELECT nama, keterangan, gambar FROM jenis_produk',
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
        // return res.status(401).send({
        //     statuscode:408,
        //     message: 'Sesi anda tidak valid'
        // });
    }
}

async function tambahJenisProduk(req, res, next){
    try{
        console.log(`Tambah Data Jenis Produk ${req.body.nama} ${Date.now()}...`);
        const token = req.body.token;
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        let jenisprodukdata = {
            keterangan:req.body.keterangan,
            nama:req.body.nama,
            gambar:req.body.gambar
        };
        await database.query("START TRANSACTION");
        await database.query('INSERT into jenis_produk set ?', jenisprodukdata, function(err, result){
            if (err) throw err;
        });
        await database.query("COMMIT");
        next();
     }catch(err){
         await database.query("ROLLBACK");
         console.log("Rollback");
    }
}

async function ubahJenisProduk(req, res, next){
    try{
        console.log(`Ubah Data Jenis Produk ${req.body.nama} ${Date.now()}...`);
        const token = req.body.token;
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
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
        next();
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