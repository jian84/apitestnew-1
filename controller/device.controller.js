require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataDevice(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        database.query('SELECT iddevice, kode_device, serial_device, hardware_id, ipaddress FROM device',
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

async function tambahDevice(req, res, next){
    if(Object.keys(req.body).length != 5){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let devicedata = {
                kode_device: req.body.kode_device,
                serial_device: req.body.serial_device,
                hardware_id: req.body.hardware_id,
                ipaddress: req.body.ipaddress
            };
            await database.query("START TRANSACTION");
            await database.query('INSERT into device set ?', devicedata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Tambah Data ${req.body.kode_device}...`);
            req.kode = 201;
            next();
        }catch(err){
            await database.query("ROLLBACK");
            req.kode = 401;
            next();
        }
    }
}

async function ubahDevice(req, res, next){
    if(Object.keys(req.body).length != 6){
        req.kode = 405;
        next();
    }else{
        try{
            const token = req.body.token;
            const decode = jwt.verify(token, process.env.ACCESS_SECRET);
            let devicedata = {
                kode_device: req.body.kode_device,
                serial_device: req.body.serial_device,
                hardware_id: req.body.hardware_id,
                ipaddress: req.body.ipaddress
            };
            await database.query("START TRANSACTION");
            await database.query(`UPDATE device set ? where iddevice= ${database.escape(req.body.iddevice)}`, devicedata, function(err, result){
                if (err) throw err;
            });
            await database.query("COMMIT");
            console.log(`Ubah Data Device ${req.body.kode_device}...`);
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
    dataDevice,
    tambahDevice,
    ubahDevice   
}