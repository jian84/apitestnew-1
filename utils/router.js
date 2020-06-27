//Plugin
require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
global.refreshTokens = []

//HOME API
router.get('/', function(req, res){
    res.json({"message": "Selamat Datang"});
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

//PENGGUNA
var RouteReistrasi = require('../controller/pengguna.controller');
router.post('/registrasi', RouteReistrasi.Registrasi, (req, res, next) => {
    return res.sendStatus(200);
});

//JENIS PRODUK
var RouteJenisProduk = require('../controller/jenisproduk.controller');
router.get('/jenisproduk', RouteJenisProduk.dataJenisProduk, (req, res, next) => {
    if(req.kode == 201){
        // console.log("----"+req.dataPengguna.idpengguna);
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/jenisproduk', RouteJenisProduk.tambahJenisProduk, (req, res, next) => {
    return res.sendStatus(200);
});
router.put('/jenisproduk', RouteJenisProduk.ubahJenisProduk, (req, res, next) => {
    return res.statusCode(200);
});

//CUSTOMER
var RouteCustomer = require('../controller/customer.controller');
router.get('/customer', RouteCustomer.dataCustomer, (req, res, next) => {
    if(req.kode == 201){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/customer', RouteCustomer.tambahCustomer, (req, res, next) => {
    return res.sendStatus(200);
});
router.put('/customer', RouteCustomer.ubahCustomer, (req, res, next) => {
    return res.sendStatus(200);
});

//PROVINSI
var RouteProvinsi = require('../controller/provinsi.controller');
router.get('/provinsi', RouteProvinsi.dataProvinsi, (req, res, next) => {
    if(req.kode == 201){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/provinsi', RouteProvinsi.tambahProvinsi, (req, res, next) => {
    return res.sendStatus(200);
});
router.put('/provinsi', RouteProvinsi.ubahProvinsi, (req, res, next) => {
    return res.sendStatus(200);
});

//KOTA
var RouteKota = require('../controller/kota.controller');
router.get('/kota', RouteKota.dataKota, (req, res, next) => {
    if(req.kode == 201){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/kota', RouteKota.tambahKota, (req, res) => {
    console.log(req.kode);
    return res.sendStatus(req.kode);
});
router.put('/kota', RouteKota.ubahkota, (req, res, next) => {
    return res.sendStatus(200);
});

//KONDISI
var RouteKondisi = require('../controller/kondisi.controller');
router.get('/kondisi', RouteKondisi.dataKondisi, (req, res, next) => {
    if(req.kode == 201){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/kondisi', RouteKondisi.tambahKondisi, (req, res, next) => {
    return res.sendStatus(200);
});
router.put('/kondisi', RouteKondisi.ubahKondisi, (req, res, next) => {
    return res.sendStatus(200);
});

module.exports = router;