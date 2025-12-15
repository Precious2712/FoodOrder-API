const UserOrder = require('../models/user-order');
const mongoose = require('mongoose');

const createUserOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const userName = req.user.name;

        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Items are required",
            });
        }

        const incomingItem = items[0];

        let order = await UserOrder.findOne({ userId });

        if (!order) {
            const quantity = incomingItem.quantity || 1;
            const total = incomingItem.itemPrice * quantity;

            order = await UserOrder.create({
                userId,
                userName,
                items: [
                    {
                        ...incomingItem,
                        quantity,
                        total
                    },
                ],
                grandTotal: total,
            });

            return res.status(201).json({
                message: "Order created",
                order,
            });
        }

        const existingItem = order.items.find(
            (item) => item.itemName === incomingItem.itemName
        );

        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.total =
                existingItem.quantity * existingItem.itemPrice;
        } else {
            order.items.push({
                ...incomingItem,
                quantity: 1,
                total: incomingItem.itemPrice,
            });
        }

        order.grandTotal = order.items.reduce(
            (sum, item) => sum + item.total,
            0
        );

        await order.save();

        res.status(200).json({
            message: "Order updated",
            order,
        });
        console.log('user-order', order);

    } catch (error) {
        console.error("Create order error:", error.message);
        res.status(500).json({
            message: "Server error",
        });
    }
};



const getUserOrder = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID",
        });
    }

    try {
        const orders = await UserOrder.find({ userId: id });
        console.log('user-placement-order', orders);

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error("Get order error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};



module.exports = {
    createUserOrder,
    getUserOrder
};
