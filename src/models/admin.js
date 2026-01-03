const mongoose = require('mongoose');

const { Schema } = mongoose;

const admin = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },

    password: {
        type: String,
        required: true
    },

    fullName: {
        type: String,
        required: true
    }
});

const administrator = mongoose.model('admin', admin);

module.exports = administrator;