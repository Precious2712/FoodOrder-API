const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        amount: {
            type: Number, // stored in kobo
            required: true,
        },

        reference: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        status: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED"],
            default: "PENDING",
        },

        channel: {
            type: String, // card, bank, ussd
        },
    },
    { timestamps: true }
);

const paymentGateWay = mongoose.model('paystack', paymentSchema);

module.exports = paymentGateWay;