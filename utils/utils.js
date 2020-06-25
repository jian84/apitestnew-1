require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


function auth(role){
    return(req, res, next) => {
        if(req.dataPengguna.akses != role){
            res.status(401).send('Akses Anda tidak aman')
        }
    }
}