//Plugin
require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
global.refreshTokens = []

//MIDDLEWARE
const penggunaMiddleware = require('../middleware/registrasi.middleware');
router.get('/', function(req, res){
    res.json({"message": "Selamat Datang"});
});

//PENGGUNA
var RouteToReistrasiController = require('../controller/pengguna.controller');
router.post('/registrasi', penggunaMiddleware.validateRegistrasi, function(req, res) {
    RouteToReistrasiController.controllerRegistrasi(req, res)
});

//LOGIN
var RouteToLoginController = require('../controller/login.controller');
router.post('/login', function(req, res){
    RouteToLoginController.controllerLogin(req, res)
});
var RouteIsLoginin = require('../middleware/login.middleware');
router.get('/ceklogin', RouteIsLoginin.isLoggedIn, (req, res, next)=>{
    // console.log(req.dataPengguna);
    return res.sendStatus(201);
});

//LOGOUT
router.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.status(204).send('Anda Berhasil Logout')
});

//EMAIL VERIFICATION
var RouteToVerifyEmailController = require('../controller/emailverification.controller');
router.get('/verify_email', function(req, res){
    RouteToVerifyEmailController.ControllerEmailverification(req, res)
});
//NEW TOKEN GENERATOR
router.post('/newtoken', (req, res) => {
    const refreshToken = req.body.token;
    if(refreshToken == null ){
        return res.sendStatus(401)
    }
    if(!refreshTokens.includes(refreshToken)){
        return res.sendStatus(403)
    }
    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, pengguna) => {
        if(err){
            return res.sendStatus(403)

        }
        const accessToken = RouteToLoginController.generateToken({
            email: pengguna.email,
            akses: pengguna.akses
        })
        res.json({
            accessToken: accessToken
        })
    })
});

//JENIS PRODUK
var RouteJenisProduk = require('../controller/jenisproduk.controller');
router.get('/jenisproduk', RouteJenisProduk.dataJenisProduk);
router.post('/jenisproduk', RouteJenisProduk.tambahJenisProduk);
router.put('/jenisproduk', RouteJenisProduk.ubahJenisProduk);

//CUSTOMER
var RouteCustomer = require('../controller/customer.controller');
router.get('/customer', RouteCustomer.dataCustomer);
router.post('/customer', RouteCustomer.tambahCustomer);
router.put('/customer', RouteCustomer.ubahCustomer);

//PROVINSI
var RouteProvinsi = require('../controller/provinsi.controller');
router.get('/provinsi', RouteProvinsi.dataProvinsi);
router.post('/provinsi', RouteProvinsi.tambahProvinsi);
router.put('/provinsi', RouteProvinsi.ubahProvinsi);

//KOTA
var RouteKota = require('../controller/kota.controller');
router.get('/kota', RouteKota.dataKota);
router.post('/kota', RouteKota.tambahKota);
router.put('/kota', RouteKota.ubahkota);

//KONDISI
var RouteKondisi = require('../controller/kondisi.controller');
router.get('/kondisi', RouteKondisi.dataKondisi);
router.post('/kondisi', RouteKondisi.tambahKondisi);
router.put('/kondisi', RouteKondisi.ubahKondisi);

//PROMO
var RoutePromo = require('../controller/promo.controller');
router.get('/promo', RoutePromo.dataPromo);
router.post('/promo', RoutePromo.tambahPromo);
router.put('/promo', RoutePromo.ubahPromo);

module.exports = router;