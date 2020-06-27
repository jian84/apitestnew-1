require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataCustomer(req, res){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        database.query('SELECT idcustomer, nama, alamat, email, noktp, nohp FROM customer where blacklist=0',
        [],
        function(error, rows, field){
            if(error){
                req.kode = 400;
                req.message = "Sorry, something went wrong";
                next();
            }else{
                req.kode = 201;
                req.data = rows;
                next();
            }
        });
    }catch(err){
        req.kode = 403;
        next();
    }
}

async function tambahCustomer(req, res){
    try{
        console.log(`Tambah Data Customer ${req.body.nama} ${Date.now()}...`);
        const token = req.body.token;
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        let customerdata = {
            nama:req.body.nama,
            alamat:req.body.alamat,
            noktp:req.body.noktp,
            email:req.body.email,
            nohp:req.body.nohp,
            blacklist: 0,
            idkota: req.body.idkota,
            idpengguna: decode.idpengguna
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