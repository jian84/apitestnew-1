require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataJenisProduk(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        console.log("--// LOAD JENIS PRODUK //--");
        // req.dataPengguna = decode;
        database.query('SELECT l.idlokasi, jp.idjenis_produk, nama as kapasitas, p.keterangan, p.harga, p.gambar, k.nama_kota, l.nama_lokasi FROM jenis_produk jp, produk p, lokasi l, kota k where jp.idjenis_produk=p.idjenis_produk AND p.idlokasi=l.idlokasi AND l.idkota=k.idkota Group by p.idjenis_produk, p.idlokasi;',
        [],
        function(error, rows, field){
            if(error){
                req.kode = 204;
                next();
            }else{
                req.kode = 200;
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

async function tambahJenisProduk(req, res, next){
    if(Object.keys(req.body).length != 4){
        req.kode = 405;
        next();
    }else{
        try{
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
            console.log(`Tambah Data Jenis Produk ${req.body.nama}...`);
            req.kode = 201;
            next();
        }catch(err){
            await database.query("ROLLBACK");
            req.kode = 401;
            next();
        }
    }
}

async function ubahJenisProduk(req, res, next){
    if(Object.keys(req.body).length != 5){
        req.kode = 405;
        next();
    }else{
        try{
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
            });
            await database.query("COMMIT");
            console.log(`Ubah Data Jenis Produk ${req.body.nama} ${Date.now()}...`);
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
    dataJenisProduk,
    tambahJenisProduk,
    ubahJenisProduk   
}