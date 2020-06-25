require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('../utils/database');
const crypto = require('crypto')
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API);
function ControllerEmailverification(req, res){
    database.query(
        `select idpengguna, status, email from pengguna where token_mail= ${database.escape(req.query.token)};`,
        (err, result) => {
          if(err){
            throw err;
            return res.status(400).send({
              message: err
            });
          }
          //token does not exists
          if(!result.length){
            return res.status(401).send({msg: 'Incorrect infomation'})
          }
          else{
            if(result[0].status==1) {return res.status(401).send({
              message: 'Email sudah diverifikasi!'
            })}
    
            database.query(
              `update pengguna set status=1 where idpengguna='${result[0].idpengguna}'`
            );
            const message = {
              to: result[0].email,
              from: 'admin@horang.id',
              subject: '[HORANG]Success verification',
              text: 'Welcome to Horang Apps. Your application ready to be used',
            };
            sgMail.send(message).then(() => {
                console.log('Email sent')
            }).catch((error) => {
                console.log(error.response.body)
            })
            return res.status(200).send({message: 'Verify success'});
          }
        }
    );
}

module.exports = {
  ControllerEmailverification
}