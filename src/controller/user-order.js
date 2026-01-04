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
        // console.log('user-order', order);

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
        // console.log('user-placement-order', orders);

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


const increaseQuantity = async (req, res) => {
    const { id: itemId } = req.params;
    const userId = req.user.id;

    try {
        const order = await UserOrder.findOne({ userId });

        if (!order) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const item = order.items.find(
            (el) => el._id.toString() === itemId
        );

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        item.quantity += 1;

        item.total = item.quantity * item.itemPrice;

        order.grandTotal = order.items.reduce(
            (sum, el) => sum + el.total,
            0
        );

        await order.save();

        res.status(200).json({
            message: "Item quantity increased successfully",
            item,
            grandTotal: order.grandTotal
        });

    } catch (error) {
        console.error("Increase quantity error:", error.message);
        res.status(500).json({
            message: "Server error"
        });
    }
};

const decreaseQuantity = async (req, res) => {
    const { id: itemId } = req.params;
    const userId = req.user.id;

    try {
        const order = await UserOrder.findOne({ userId });

        if (!order) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const item = order.items.find(
            (el) => el._id.toString() === itemId
        );

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        item.quantity = Math.max(1, item.quantity - 1);

        item.total = item.quantity * item.itemPrice;

        order.grandTotal = order.items.reduce(
            (sum, el) => sum + el.total,
            0
        );

        await order.save();

        res.status(200).json({
            message: "Item quantity increased successfully",
            item,
            grandTotal: order.grandTotal
        });

    } catch (error) {
        console.error("Increase quantity error:", error.message);
        res.status(500).json({
            message: "Server error"
        });
    }
}


const deleteItem = async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    try {
        const order = await UserOrder.findOneAndUpdate(
            { userId },
            { $pull: { items: { _id: id } } },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        order.grandTotal = order.items.reduce(
            (sum, item) => sum + item.total,
            0
        );

        await order.save();

        res.status(200).json({
            message: "Item removed successfully",
            items: order.items,
            grandTotal: order.grandTotal,
        });

    } catch (error) {
        console.error("Delete item error:", error.message);
        res.status(500).json({
            message: "Server error",
        });
    }
};


module.exports = {
    createUserOrder,
    getUserOrder,
    increaseQuantity,
    decreaseQuantity,
    deleteItem
};
