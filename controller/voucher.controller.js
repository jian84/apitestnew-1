require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataVoucher(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        console.log(decode.idpengguna);
        database.query('SELECT idvoucher, kode_voucher, jumlah_voucher, persentase, nominal, keterangan FROM voucher',
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

async function tambahVoucher(req, res, next){
    if(Object.keys(req.body).length != 7){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let voucherdata = {
                kode_voucher:req.body.kode_voucher,
                jumlah_voucher:req.body.jumlah_voucher,
                persentase:req.body.persentase,
                nominal:req.body.nominal,
                keterangan:req.body.keterangan,
                gambar:req.body.gambar
            };
            await database.query("START TRANSACTION");
            await database.query('INSERT into voucher set ?', voucherdata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Tambah Data voucher ${req.body.kode_voucher}...`);
            req.kode = 201;
            next();
        }catch(err){
            await database.query("ROLLBACK");
            req.kode = 401;
            next();
        }
    }
}

async function ubahVoucher(req, res, next){
    if(Object.keys(req.body).length != 8){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let voucherdata = {
                kode_voucher:req.body.kode_voucher,
                jumlah_voucher:req.body.jumlah_voucher,
                persentase:req.body.persentase,
                nominal:req.body.nominal,
                keterangan:req.body.keterangan,
                gambar:req.body.gambar
            };
            await database.query("START TRANSACTION");
            await database.query(`UPDATE voucher set ? where idvoucher= ${database.escape(req.body.idvoucher)}`, voucherdata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Ubah Data Jenis Produk ${req.body.kode_voucher}...`);
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
    dataVoucher,
    tambahVoucher,
    ubahVoucher   
}