require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');
const { connect } = require('../utils/database');

async function tambahOrder(req, res, next){
    var idordernya;
    if(Object.keys(req.body).length != 15){
        req.kode = 405;
        next();
    }else{
        try{
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            const flagAsuransi = req.body.flagasuransi;
            const flagvoucher = req.body.flagvoucher;
            const generatenoorder = Math.floor(100000000 + Math.random() * 900000000);
            var datenow = { toSqlString: function() { return 'DATE(NOW())'; } };
            database.beginTransaction(function(err){
                if(err) { throw err; }
                database.query("SELECT idproduk from produk where idkondisi=1 and idlokasi = '${req.body.idlokasi}' and idjenis_produk='${req.body.idjenis_produk}' AND idproduk NOT IN ( select idproduk from `order` a, detail_order b where a.idorder=b.idorder and a.status=0 and '${database.escape(req.body.tanggal_mulai_order)}' between tanggal_mulai and tanggal_akhir UNION select idproduk from `order` a, detail_order b where a.idorder=b.idorder and a.status=0 and '${database.escape(req.body.tanggal_akhir_order)}' between tanggal_mulai and tanggal_akhir) ORDER BY idproduk asc limit 1;", 
                [], function(err, result){
                    if(err) {
                        throw err;
                    }
                    else{
                        if(result.length<=0) { throw err; }

                        let orderdata = {
                            no_order: "ORDR-"+generatenoorder,
                            keterangan: req.body.keterangan,
                            total_harga: reeeeq.body.total_harga,
                            idcustomer: req.body.idcustomer, 
                            tanggal_order: datenow,
                        };
                        database.query('INSERT into `order` set ?', orderdata, function(err, resultidorder){
                            if(err){
                                database.rollback(function(){
                                    throw err;
                                });
                            }else{
                                let orderdetaildata = {
                                    idorder: resultidorder.insertId,
                                    idproduk: result[0].idproduk,
                                    jumlah_sewa: req.body.jumlah_sewa,
                                    harga: req.body.harga,
                                    tanggal_mulai: datenow,
                                };
                                idordernya = resultidorder.insertId;
                                database.query('INSERT INTO detail_order set ?', orderdetaildata, function(err, result){
                                    if(err){
                                        database.rollback(function(){
                                            throw err;
                                        });
                                    }else{
                                        let pembayarandata = {
                                            idorder: resultidorder.insertId,
                                            idpayment_gateway: req.body.idpayment_gateway,
                                            kode_refrensi: "BYR-"+generatenoorder,
                                            nominal: req.body.total_harga,
                                            komisi_provider: 100,
                                            keterangan: "-",
                                        };
                                        database.query('INSERT INTO pembayaran set ?', pembayarandata, function(err, result){
                                            if(err) {
                                                database.rollback(function(){
                                                    throw err;
                                                });                
                                            }
                                        });
                                        if(flagAsuransi == 1){
                                            let orderasuransidata = {
                                                idorder: resultidorder.insertId,
                                                idasuransi: req.body.idasuransi,
                                                nomor_polis: req.body.nomor_polis,
                                                tanggal_berakhir_polis: req.body.tanggal_berakhir_polis,
                                            };
                                            database.query('INSERT INTO order_asuransi set ?', orderasuransidata, function(err, result){
                                                if(err) {
                                                    database.rollback(function(){
                                                        throw err;
                                                    });                    
                                                }
                                            });
                                        }
                                        if(flagvoucher == 1){
                                            let orderpromodata = {
                                                idorder: resultidorder.insertId,
                                                idvoucher: req.body.idvoucher,
                                            };
                                            database.query('INSERT INTO order_voucher set ?', orderpromodata, function(err, result){
                                                if(err) {
                                                    database.rollback(function(){
                                                        throw err;
                                                    });                    
                                                }
                                            });
                                        }
                                        // req.kode = 200;
                                        req.data = "- "+idordernya;
                                        next();
                                    }
                                });
                            }
                            
                            database.commit(function(err){
                                if(err){
                                    database.rollback(function(){
                                        throw err;
                                    });
                                }
                                console.log(`Tambah Data Order...`+idordernya);
                                req.kode = 201;
                                req.data = idordernya;
                                next();                    
                            });
                        });//end start insert
                    }
                });
            });//end begin transaction
        }catch(err){
            req.kode = 403;
            next();
        }
    }
}

//input paramater : token, iddetailorder
//select idproduk sama dengan tambah order tetapi ditambah kondisi=2 (container cadangan)
async function mutasicontainer(req, res, next){
    if(Object.keys(req.body).length != 8){
        req.kode = 405;
        next();
    }else{
        try{
            //CODE HERE
            req.kode = 401;
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            database.beginTransaction(function(err){
                if (err) { throw err; }
                database.query("select b.idproduk, idlokasi, idjenis_produk, tanggal_mulai, tanggal_akhir from `order` a, detail_order b, produk where a.idorder=b.idorder and b.idproduk=produk.idproduk and b.iddetail_order=? and a.status=0 and now() between tanggal_mulai and tanggal_akhir", req.body.iddetail_order, function(err,result){
                    if(err) { 
                        throw err; 
                    }else{
                        if(result.length<=0) {throw err;}
                        database.query("SELECT idproduk from produk where idlokasi='${result[0].idlokasi}' and idjenis_produk='${result[0].idjenis_produk}' and (idkondisi=1 or idkondisi=2) and idlokasi = 1 AND idproduk NOT IN ( select idproduk from `order` a, detail_order b where a.idorder=b.idorder and a.status=0 and '${database.escape(result[0].tanggal_mulai)}' between tanggal_mulai and tanggal_akhir UNION select idproduk from `order` a, detail_order b where a.idorder=b.idorder and a.status=0 and '${database.escape(result[0].tanggal_akhir)}' between tanggal_mulai and tanggal_akhir) ORDER BY idkondisi, idproduk asc limit 1;", 
                        [], function(err1, result1){
                            if(err1) {
                                throw err1;
                            }
                            else{
                                if(result1.length<=0) { throw err; }
                                database.query("UPDATE detail_order set idproduk = '${result1[0].idproduk}' where iddetail_order=?", req.body.iddetail_order, function(err2, result2){
                                    if(err2){
                                        database.rollback(function(){
                                            database.end;
                                            throw err;
                                        });
                                    }
                                    else{
                                        database.commit(function(err){
                                            if(err){
                                                database.rollback(function(){
                                                    database.end;
                                                    throw err;
                                                });
                                            }
                                            else{
                                                req.kode = 201;
                                                console.log("Mutasi container sukses");
                                                database.end;
                                                next()
                                            }
                                        });   
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }catch(err){
            req.kode = 403;
            next();
        }
    }
}

module.exports = {
    tambahOrder,
    mutasicontainer
}