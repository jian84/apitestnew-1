require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

async function tambahOrder(req, res, next){
    if(Object.keys(req.body).length != 13){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            const flagAsuransi = req.body.flagasuransi;
            const flagvoucher = req.body.flagvoucher;
            var idproduknya;
            const generatenoorder = Math.floor(100000000 + Math.random() * 900000000);
        
            let orderdata = {
                no_order: generatenoorder,
                keterangan: req.body.keterangan,
                total_harga: req.body.total_harga,
                idcustomer: req.body.idcustomer,
            };
            await database.query("START TRANSACTION");
            await database.query('INSERT into `order` set ?', orderdata, function(err, resultidorder){
                if (err){
                    throw err;  
                } else{
                    database.query(`SELECT idproduk from produk where idlokasi = ${req.body.idlokasi} AND idproduk NOT IN (SELECT idproduk from detail_order) Limit 0,1`, [], function(err, result){
                        if(err){
                            throw err
                        }
                        let orderdetaildata = {
                            idorder: resultidorder.insertId,
                            idproduk: result[0].idproduk,
                            jumlah_sewa: req.body.jumlah_sewa,
                            harga: req.body.harga,
                        };
                        database.query('INSERT INTO detail_order set ?', orderdetaildata, function(err, result){
                            if(err) throw err;
                        });
                        if(flagAsuransi == 1){
                            let orderasuransidata = {
                                idorder: resultidorder.insertId,
                                idasuransi: req.body.idasuransi,
                                nomor_polis: req.body.nomor_polis,
                                tanggal_berakhir_polis: req.body.tanggal_berakhir_polis,
                            };
                            database.query('INSERT INTO order_asuransi set ?', orderasuransidata, function(err, result){
                                if(err) throw err;
                            });
                        }
                         if(flagvoucher == 1){
                            let orderpromodata = {
                                idorder: resultidorder.insertId,
                                idvoucher: req.body.idvoucher,
                            };
                            database.query('INSERT INTO order_voucher set ?', orderpromodata, function(err, result){
                                if(err) throw err;
                            });
                        }
                    });
                }
            });
            await database.query("COMMIT");
            console.log(`Tambah Data Order...`);
            req.kode = 201;
            next();
        }catch(err){
            await database.query("ROLLBACK");
            req.kode = 401;
            next();
        }
    }
}

module.exports = {
    tambahOrder 
}