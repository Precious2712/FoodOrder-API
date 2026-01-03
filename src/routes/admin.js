const express = require('express');
const app = express.Router();

const {
    createAdmin,
    logAdmin,
    getProfile,
    getALLPayment
} = require('../controller/admin');

const adminToken = require('../middleware/verifyAdmin');

app.post('/create-admin', createAdmin);

app.post('/log-admin', logAdmin)

app.get('/get-admin', getProfile);

app.get('/get-all-payment', adminToken, getALLPayment );

module.exports = app;