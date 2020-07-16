require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

async function tambahOrder(req, res, next){
    var idordernya;
    if(Object.keys(req.body).length != 15){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            const flagAsuransi = req.body.flagasuransi;
            const flagvoucher = req.body.flagvoucher;
            const generatenoorder = Math.floor(100000000 + Math.random() * 900000000);
            var datenow = { toSqlString: function() { return 'DATE(NOW())'; } };
            await database.query("START TRANSACTION");
            await database.query(`SELECT idproduk from produk, kondisi where produk.idkondisi=kondisi.idkondisi and produk.idkondisi=1 and idlokasi = ${req.body.idlokasi} AND idproduk NOT IN (SELECT idproduk from detail_order where  DATE_ADD(tanggal_mulai, INTERVAL jumlah_sewa DAY)<=NOW());`, [], function(err, result){
                if (err){
                    throw err;  
                } else{
                    let orderdata = {
                        no_order: "ORDR-"+generatenoorder,
                        keterangan: req.body.keterangan,
                        total_harga: req.body.total_harga,
                        idcustomer: req.body.idcustomer,
                        tanggal_order: datenow,
                    };
                    database.query('INSERT into `order` set ?', orderdata, function(err, resultidorder){
                        if(err){
                            throw err
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
                                    throw err
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
                                    req.kode = 200;
                                    req.data = "- "+idordernya;
                                    next();
                                    // database.query('select o.idorder, p.idpembayaran, pg.idpayment_gateway, d.idproduk, o.no_order, o.total_harga, o.keterangan, d.jumlah_sewa, d.harga, p.kode_refrensi, p.nominal, pg.nama_provider, pr.kode_kontainer from `order` o, detail_order d, pembayaran p, payment_gateway pg, produk pr where o.idorder=d.idorder and pr.idproduk=d.idproduk and o.idorder=p.idorder and pg.idpayment_gateway=p.idpayment_gateway and o.idorder=?;',
                                    // [idordernya],
                                    // function(error, rows, field){
                                    //     if(error){
                                    //         req.kode = 204;
                                    //         next();
                                    //     }else{
                                    //         req.kode = 200;
                                    //         req.data = rows;
                                    //         next();
                                    //     }
                                    // });
                                    // console.log("idordernya: "+idordernya);
                                }
                            });
                        }
                    });
                }
            });
            await database.query("COMMIT");
            // console.log(`Tambah Data Order...`+idordernya);
            // req.kode = 201;
            // req.data = idordernya;
            // next();
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