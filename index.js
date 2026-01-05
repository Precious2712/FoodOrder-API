require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.post(
    "/api/v1/paystack/webhook",
    express.raw({ type: "application/json" }),
    require("./src/controller/paystack").paystackWebhook
);

app.use(express.json());

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://product-ordering-webapp.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));


const auths = require('./src/routes/users');
const order = require('./src/routes/user-order');
const payment = require('./src/routes/paystack');
const admins = require('./src/routes/admin');

app.use('/api/v1', auths);
app.use('/api/v1', order);
app.use('/api/v1/paystack', payment);
app.use('/api/v1', admins);


async function start() {
    try {
        const url = await mongoose.connect(process.env.MONO_URL);
        if (url) {
            console.log('MongoDB connection established');
            app.listen(PORT, () => {
                if (PORT) {
                    console.log(`Server listening to port ${PORT}`);
                }
            })
        } else {
            console.log('No MongoDB connection established');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
    }
}

start();
