const express = require('express');

const app = express.Router();

const {
    createPaymentGateway,
    verifyPayment,
    paystackWebhook
} = require('../controller/paystack');

const verifyUser = require('../middleware/verifyUserWithToken');

app.post('/payments/init', verifyUser, createPaymentGateway);

app.post('/payments/verify', verifyUser, verifyPayment);

app.post('/paystack/webhook', paystackWebhook);

module.exports = app;