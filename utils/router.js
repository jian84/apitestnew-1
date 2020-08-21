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

//AKUN


//ASURANSI
var RouteAsuransi = require('../controller/asuransi.controller');
router.get('/asuransi', RouteAsuransi.dataAsuransi, (req, res, next) => {
    if(req.kode == 200){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/asuransi', RouteAsuransi.tambahAsuransi, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.put('/asuransi', RouteAsuransi.ubahAsuransi, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

//CUSTOMER
var RouteCustomer = require('../controller/customer.controller');
router.get('/customerall', RouteCustomer.dataAllCustomer, (req, res, next) => {
    if(req.kode == 202){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.get('/customer', RouteCustomer.dataCustomerCustom, (req, res, next) => {
    if(req.kode == 202){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/customer', RouteCustomer.tambahCustomer, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/ecustomer', RouteCustomer.ubahCustomer, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

//DEVICE
var RouteDevice = require('../controller/device.controller');
router.get('/device', RouteDevice.dataDevice, (req, res, next) => {
    if(req.kode == 200){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/device', RouteDevice.tambahDevice, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/edevice', RouteDevice.ubahDevice, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

//EMAIL VERIFICATION
var RouteToVerifyEmailController = require('../controller/emailverification.controller');
router.get('/verify_email', function(req, res){
    RouteToVerifyEmailController.ControllerEmailverification(req, res)
});

//HISTORY ORDER
var RouteHistory = require('../controller/history.controller');
router.get('/histori', RouteHistory.dataHistoryOrder, (req, res, next) => {
    if(req.kode == 200){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});

//JENIS PRODUK
var RouteJenisProduk = require('../controller/jenisproduk.controller');
router.get('/jenisproduk', RouteJenisProduk.dataJenisProduk, (req, res, next) => {
    if(req.kode == 200){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/jenisproduk', RouteJenisProduk.tambahJenisProduk, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/ejenisproduk', RouteJenisProduk.ubahJenisProduk, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

//KEY 
var RouteToKey = require('../controller/key.controller');
router.post('/open', RouteToKey.openApps, (req, res, next)=> {
    if(req.kode==200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

//KONDISI
var RouteKondisi = require('../controller/kondisi.controller');
router.get('/kondisi', RouteKondisi.dataKondisi, (req, res, next) => {
    if(req.kode == 200){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/kondisi', RouteKondisi.tambahKondisi, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/ekondisi', RouteKondisi.ubahKondisi, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

//KOTA
var RouteKota = require('../controller/kota.controller');
router.get('/kota', RouteKota.dataKota, (req, res, next) => {
    if(req.kode == 202){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/kota', RouteKota.tambahKota, (req, res) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/ekota', RouteKota.ubahkota, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

//LOGIN
var RouteToLoginController = require('../controller/login.controller');
router.post('/login', function(req, res){
    RouteToLoginController.controllerLogin(req, res)
});
var RouteIsLoginin = require('../middleware/login.middleware');
router.get('/ceklogin', RouteIsLoginin.isLoggedIn, (req, res, next)=>{
    // console.log(req.dataPengguna);
    return res.sendStatus(200);
});

//LOGOUT
router.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.status(204).send('Anda Berhasil Logout')
});

//LOKASI
var RouteLokasi = require('../controller/lokasi.controller');
router.get('/lokasi', RouteLokasi.dataLokasi, (req, res, next) => {
    if(req.kode == 200){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/lokasi', RouteLokasi.tambahLokasi, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/elokasi', RouteLokasi.ubahLokasi, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

//MYORDER
var RouteMyOrder = require('../controller/myorder.controller');
router.get('/orderdet/:idorder', RouteMyOrder.detailOrder, (req, res, next) => {
    if(req.kode == 200){
        return res.status(200).send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.get('/mystorage', RouteMyOrder.listmystorage, (req, res, next) => {
    if(req.kode == 200){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
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

//ORDER
var RouteOrder = require('../controller/order.controller');
router.post('/order', RouteOrder.tambahOrder, (req, res, next) => {
    if(req.kode == 200){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/unknown', RouteOrder.unknown, (req, res, next) => {
    if(req.kode == 200){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});

//PAYMENT GATEWAY
var RoutePaymentGateway = require('../controller/paymentgateway.controller');
router.get('/paymentgateway', RoutePaymentGateway.dataPaymentGateway, (req, res, next) => {
    if(req.kode == 200){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/paymentgateway', RoutePaymentGateway.tambahPaymentGateway, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/epaymentgateway', RoutePaymentGateway.ubahPaymentGateway, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

//PENGGUNA
var RouterPengguna = require('../controller/pengguna.controller');
router.post('/registrasi', RouterPengguna.Registrasi, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/epengguna', RouterPengguna.ubahPengguna, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/ipin', RouterPengguna.insertPin, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/upin', RouterPengguna.ubahPin, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/ipassword', RouterPengguna.insertPassword, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/upassword', RouterPengguna.ubahPassword, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

//PRODUK
var RouterProduk = require('../controller/produk.controller');
router.post('/produk', RouterProduk.tambahProduk, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/eproduk', RouterProduk.ubahProduk, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

//PROVINSI
var RouteProvinsi = require('../controller/provinsi.controller');
router.get('/provinsi', RouteProvinsi.dataProvinsi, (req, res, next) => {
    if(req.kode == 200){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/provinsi', RouteProvinsi.tambahProvinsi, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/eprovinsi', RouteProvinsi.ubahProvinsi, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

//SETTING
var RouteSetting = require('../controller/setting.controller');
router.get('/setting', RouteSetting.dataSetting, (req, res, next) => {
    if(req.kode == 200){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/setting', RouteSetting.tambahSetting, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/esetting', RouteSetting.ubahSetting, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

//VOUCHER
var RouteVoucher = require('../controller/voucher.controller');
router.get('/voucher', RouteVoucher.dataVoucher, (req, res, next) => {
    if(req.kode == 200){
        return res.send(req.data);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/voucher', RouteVoucher.tambahVoucher, (req, res, next) => {
    if(req.kode == 201){
        return res.sendStatus(201);
    }else{
        return res.sendStatus(req.kode);
    }
});
router.post('/evoucher', RouteVoucher.ubahVoucher, (req, res, next) => {
    if(req.kode == 200){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(req.kode);
    }
});

module.exports = router;