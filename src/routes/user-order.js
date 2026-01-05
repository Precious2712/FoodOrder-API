const express = require('express');

const app = express.Router();

const {
    createUserOrder,
    getUserOrder,
    updateQuantity,
    deleteItem
} = require('../controller/user-order');

const verifyUser = require('../middleware/verifyUserWithToken');

app.post('/create-order', verifyUser, createUserOrder);

app.get('/user-order/:id', verifyUser, getUserOrder);

app.put("/cart/:id/quantity", verifyUser, updateQuantity);

app.delete('/delete-item/:id', verifyUser, deleteItem);

module.exports = app;