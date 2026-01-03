
const mongoose = require('mongoose');

const { Schema } = mongoose;

const orderItemSchema = new Schema({
    itemName: {
        type: String,
        required: true,
    },

    image: {
        type: String,
        required: true,
    },

    itemPrice: {
        type: Number,
        required: true,
    },

    quantity: {
        type: Number,
        default: 1,
    },

    total: {
        type: Number,
        required: true,
    },

});

const userOrderSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },

        userName: {
            type: String,
            required: true,
        },

        items: [orderItemSchema],

        grandTotal: {
            type: Number,
            required: true,
        },

        receiptSent: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);

const userItem = mongoose.model('UserOrder', userOrderSchema);

module.exports = userItem;