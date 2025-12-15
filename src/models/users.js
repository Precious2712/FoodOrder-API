const mongoose = require('mongoose');

const { Schema } = mongoose;

const userField = new Schema({
    name: {
        required: [true, 'Name is required'],
        type: String
    },

    email: {
        required: [true, 'Email is required'],
        type: String,
        unique: true
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