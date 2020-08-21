require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

//input parameter : token, iddetail_order
//output : 201 (success), other (failed)
async function openApps(req, res, next){
    if(Object.keys(req.body).length != 2){
        req.kode = 405;
        next();
    }else{
        const token = req.body.token;
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        database.beginTransaction(function(err){
            if(err) { throw err;}
            database.query('select idproduk from detail_order where iddetail_order=? AND DATE_ADD(detail_order.tanggal_mulai, INTERVAL jumlah_sewa day)>NOW()', req.body.iddetail_order,
                function(err, rows, field){
                    if (err){
                        database.rollback(function(){
                            req.kode = 204;
                            next();
                        });
                    }
                    else{
                        console.log("Berhasil"+rows.length);

                        if(rows.length>0){
                            let kondisidata = {
                                timeout : 10,
                                iddetail_order : req.body.iddetail_order,
                                is_released: 0,
                                idpengguna : decode.idpengguna
                            };
                            let kondisidata1 = {
                                status: 'REQUEST OPEN',
                                iddetaill_order: rows.iddetail_order
                            };

                            console.log("Insert key");
                            database.query('INSERT into key set ?', kondisidata, function(err, result){
                                if (err) {
                                    // throw err;
                                    database.rollback(function(){
                                        req.kode = 204;
                                        next();
                                    });
                                }
                            });

                            console.log("Insert log");
                            database.query('INSERT into log set ?', kondisidata1, function(err, result){
                                if (err) {
                                    // throw err;
                                    database.rollback(function(){
                                        req.kode = 204;
                                        next();
                                    });
                                }
                            }); 

                            console.log("Commit");
                            database.commit(function(err){
                                if(err){
                                    database.rollback(function(){
                                        req.kode = 204;
                                        next();
                                    });
                                }
                                req.kode = 200;
                                console.log("Transaction success");
                                next();
                            });
                        }
                        else{
                            req.kode=204;
                            console.log("EXPIRED DATE");
                            next();
                        }
                    }
                });
        });
    }
}

module.exports = {
   openApps
//    openDevice
}
