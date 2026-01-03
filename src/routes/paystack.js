const express = require('express');

const app = express.Router();

const {
    createPaymentGateway,
} = require('../controller/paystack');

const verifyUser = require('../middleware/verifyUserWithToken');

app.post('/payments/init', verifyUser, createPaymentGateway);

module.exports = app;