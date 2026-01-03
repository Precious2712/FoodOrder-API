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
            type: Number, 
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
            type: String, 
        },
    },
    { timestamps: true }
);

paymentSchema.index(
    { user: 1, amount: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: "PENDING" },
    }
);


const paymentGateWay = mongoose.model('paystack', paymentSchema);

module.exports = paymentGateWay;