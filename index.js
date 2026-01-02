require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = process.env.PORT

const app = express();

app.use(express.json());
app.use(cors());

const auths = require('./src/routes/users');
const order = require('./src/routes/user-order');
const payment = require('/src/routes/paystack');

app.use('/api/v1', auths);
app.use('/api/v1', order);
app.use('/api/v1', payment);

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
