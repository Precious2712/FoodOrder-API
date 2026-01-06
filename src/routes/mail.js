const express = require('express');

const exp = express.Router();

const {
    sendOrderEmail
} = require('../nodemailer/mailer');

const verifyUser = require('../middleware/verifyUserWithToken');

exp.post('/send-mail', verifyUser, sendOrderEmail);

module.exports = exp;