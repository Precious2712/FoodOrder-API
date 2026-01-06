const express = require('express');

const exp = express.Router();

const {
    sendOrderEmail
} = require('../nodemailer/mailer');

// const verifyUser = require('../middleware/verifyUserWithToken');

exp.post('/send-mail/products',  sendOrderEmail);

module.exports = exp;