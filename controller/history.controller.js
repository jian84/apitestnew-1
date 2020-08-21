require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function dataHistoryOrder(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        // req.dataPengguna = decode;
        database.query("select nama_customer, no_order, total_harga, jumlah_sewa from customer c, `order` o, detail_order d where c.idcustomer=o.idcustomer and o.idorder=d.idorder and c.idpengguna="+decode.idpengguna,
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


module.exports = {
    dataHistoryOrder
}