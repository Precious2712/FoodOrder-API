const mongoose = require('mongoose');

const { Schema } = mongoose;

const userField = new Schema({
    name: {
        required: [true, 'Name is required'],
        type: String
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },

    password: {
        required: true,
        type: String,
        minlength: [7, 'Minimun password is 7'],
    },

    age: {
        required: [true, 'Age is required'],
        type: Number
    },

    gender: {
        required: [true, 'Gender is required and must be Male or Female'],
        type: String,
        enum: ['Male', 'Female']
    },

});

const userSchema = mongoose.model('user', userField);

module.exports = userSchema;