require('dotenv').config()
var mysql = require('mysql');
const database = require('../utils/database');
const jwt = require('jsonwebtoken');

function detailOrder(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        var idorder = req.params.idorder;
        database.query('select o.idorder, p.idpembayaran, pg.idpayment_gateway, d.idproduk, o.no_order, o.total_harga, o.keterangan, d.jumlah_sewa, d.harga, p.kode_refrensi, p.nominal, pg.nama_provider, pr.kode_kontainer from `order` o, detail_order d, pembayaran p, payment_gateway pg, produk pr where o.idorder=d.idorder and pr.idproduk=d.idproduk and o.idorder=p.idorder and pg.idpayment_gateway=p.idpayment_gateway and o.idorder=?;',
        [idorder],
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

function listmystorage(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_SECRET);
        var idpengguna = decode.idpengguna;
        database.query('select produk.kode_kontainer, jenis_produk.nama, kota.nama_kota, tanggal_order, jumlah_sewa as hari, if(DATE_ADD(tanggal_order, INTERVAL jumlah_sewa DAY)>=NOW(), "AKTIF", "NONAKTIF") as AKTIF from `order` o, detail_order, produk, lokasi, kota, jenis_produk, customer where o.idorder=detail_order.idorder and detail_order.idproduk=produk.idproduk and produk.idlokasi=lokasi.idlokasi and lokasi.idkota=kota.idkota and produk.idjenis_produk=jenis_produk.idjenis_produk and o.idcustomer=customer.idcustomer and customer.idpengguna=?;',
        [idpengguna],
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
    detailOrder,
    listmystorage
}