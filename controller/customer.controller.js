require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataCustomer(req, res){
    try{
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        database.query('SELECT nama, alamat, email, noktp, nohp FROM customer where blacklist=0',
        [],
        function(error, rows, field){
            if(error){
                res.send(400).send({
                    message: 'Ada masalah'
                });
            }else{
                res.send(rows);
            }
        });
    }catch(err){
        return res.status(401).send({
            statuscode:408,
            message: 'Sesi anda tidak valid'
        });
    }
}

async function tambahCustomer(req, res){
    // const connection = await mysql.connection();
    try{
        console.log(`Tambah Data Customer ${req.body.nama} ${Date.now()}...`);
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        let customerdata = {
            nama:req.body.nama,
            alamat:req.body.alamat,
            noktp:req.body.noktp,
            email:req.body.email,
            nohp:req.body.nohp,
            blacklist: 0,
            idkota: req.body.idkota,
            idpengguna: req.body.idpengguna
        };
        await database.query("START TRANSACTION");
        await database.query('INSERT into customer set ?', customerdata, function(err, result){
            if (err) throw err;
            // console.log(result.insertId);
        });
        await database.query("COMMIT");
     }catch(err){
         await database.query("ROLLBACK");
         console.log("Rollback");
    }
}

async function ubahCustomer(req, res){
    try{
        console.log(`Ubah Data Customer ${req.body.nama} ${Date.now()}...`);
        const token = req.body.token;
        jwt.verify(token, process.env.ACCESS_SECRET, (err, data) => {
            if(err){
                res.sendStatus(401);
            }
        });
        let customerdata = {
            nama:req.body.nama,
            alamat:req.body.alamat,
            noktp:req.body.noktp,
            email:req.body.email,
            nohp:req.body.nohp,
            blacklist: 0,
            idkota: req.body.idkota,
            idpengguna: req.body.idpengguna
        };
        await database.query("START TRANSACTION");
        await database.query(`UPDATE customer set ? where idcustomer= ${database.escape(req.body.idcustomer)}`, customerdata, function(err, result){
            if (err) throw err;
            console.log("Ubah Data Berhasil!");
        });
        await database.query("COMMIT");
    }catch(err){
        await database.query("ROLLBACK");
        console.log("Rollback", err);
    }
}

module.exports = {
    dataCustomer,
    tambahCustomer,
    ubahCustomer   
}