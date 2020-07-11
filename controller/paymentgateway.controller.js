require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataPaymentGateway(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        database.query('SELECT idpayment_gateway, nama_provider, token_provider, status FROM payment_gateway',
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

async function tambahPaymentGateway(req, res, next){
    if(Object.keys(req.body).length != 4){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let paymentgatewaydata = {
                nama_provider: req.body.nama_provider,
                token_provider: req.body.token_provider,
                status: req.body.status
            };
            await database.query("START TRANSACTION");
            await database.query('INSERT into asuransi set ?', asuransidata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Tambah Data Asuransi...`);
            req.kode = 201;
            next();
        }catch(err){
            await database.query("ROLLBACK");
            req.kode = 401;
            next();
        }
    }
}

async function ubahPaymentGateway(req, res, next){
    if(Object.keys(req.body).length != 5){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let paymentgatewaydata = {
                nama_provider: req.body.nama_provider,
                token_provider: req.body.token_provider,
                status: req.body.status
            };
            await database.query("START TRANSACTION");
            await database.query(`UPDATE payment_gateway set ? where idpayment_gateway= ${database.escape(req.body.idpayment_gateway)}`, paymentgatewaydata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Ubah Data Asuransi ${req.body.nama_provider}...`);
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
    dataPaymentGateway,
    tambahPaymentGateway,
    ubahPaymentGateway   
}