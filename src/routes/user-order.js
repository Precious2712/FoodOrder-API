const express = require('express');

const app = express.Router();

const {
    createUserOrder,
    getUserOrder
} = require('../controller/user-order');

const verifyUser = require('../middleware/verifyUserWithToken');

app.post('/create-order', verifyUser, createUserOrder);

app.get('/user-order/:id',  getUserOrder);

module.exports = app;