const express = require('express');

const app = express.Router();

const {
    createPaymentGatement,
    verifyPayment,
    paystackWebhook
} = require('../controller/paystack');

const verifyUser = require('../middleware/verifyUserWithToken');

app.post('/api/payments/init', verifyUser, createPaymentGatement);

app.post('/verifyPayment', verifyUser, verifyPayment);

app.post('/paystackWebhook', paystackWebhook);

module.exports = app;