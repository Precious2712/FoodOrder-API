const express = require('express');

const app = express.Router();

const {
    createUser,
    signInUsers,
    dashboardPayment,
    checkUser
} = require('../controller/users');

const userToken = require('../middleware/verifyUserWithToken');

app.post('/create-user', createUser);

app.post('/sign-in-user', signInUsers);

app.get('/dashboard-payment', userToken, dashboardPayment);

app.get('/checkUser', userToken, checkUser);

module.exports = app;