require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');
const multer = require('multer');
var path = require('path');

const storage = multer.diskStorage({
    destination : path.join(__dirname+'../gambar/'),
    filename: function(req, file, cb){
            cb(null, file.fieldname + '-'+Date.now()+path.extname(file.originalname));
    }
});

const upload = multer({
    storage : storage
}).single('picture');

function dataJenisProduk(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
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
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let jenisprodukdata = {
                nama: req.body.nama,
                keterangan: req.body.keterangan,
                gambar: req.body.gambar
            };
            upload(req, res, err => {
                database.beginTransaction(function(err){
                    database.query('INTO jenis_produk set ?', jenisprodukdata, function(err, result){
                        if(err){
                            database.rollback(function() {
                                throw err;
                            });    
                        }
                        let logdata = {
                            keterangan : "Tambah Jenis Produk",
                            idpengguna: decode.idpengguna
                        }
                        database.query('INSERT INTO log_aktifitas set ?', logdata, function(err, result){
                            if(err){
                                database.rollback(function(){
                                    throw err;
                                });       
                            }
                            database.commit(function(err){
                                if(err){
                                    console.log("Error Commit")
                                    database.rollback(function(){
                                        throw err;
                                    })
                                }
                                console.log("Berhasil Menambah Jenis Produk")
                                database.end();
                                req.kode=201;                   
                                next();
                            });
                        });
                    });
                });
            });
        }catch(err){
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
            req.kode=401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let jenisprodukdata = {
                nama: req.body.nama,
                keterangan: req.body.keterangan,
                gambar: req.body.gambar
            };
            database.beginTransaction(function(err){
                database.query(`UPDATE jenis_produk set ? WHERE idjenis_produk=${database.escape(req.body.idjenis_produk)}`, jenisprodukdata, function(err, result){
                    if (err){
                        database.rollback(function() {
                            throw err;
                        }); 
                    }
                    let logdata = {
                        keterangan : "Ubah Asuransi"+result.insertId,
                        idpengguna: decode.idpengguna
                    }
                    database.query('INSERT INTO log_aktifitas set ?', logdata, function(err, result){
                        if(err){
                            database.rollback(function(){
                                throw err;
                            });
                        }
                        database.commit(function(err){
                            if(err){
                                console.log("Error Commit")
                                database.rollback(function(){
                                    throw err;
                                })
                            }
                            console.log("Berhasil Mengubah Jenis Produk")
                            database.end();
                            req.kode=200;
                            next()
                        });
                    });
                });
            });
        }catch(err){
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