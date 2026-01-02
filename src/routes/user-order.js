const express = require('express');

const app = express.Router();

const {
    createUserOrder,
    getUserOrder,
    increaseQuantity,
    decreaseQuantity
} = require('../controller/user-order');

const verifyUser = require('../middleware/verifyUserWithToken');

app.post('/create-order', verifyUser, createUserOrder);

app.get('/user-order/:id', verifyUser, getUserOrder);

app.put('/increase/:id', verifyUser, increaseQuantity);

app.put('/decrease/:id', decreaseQuantity);

module.exports = app;