const axios = require("axios");
const crypto = require("crypto");

const Payment = require("../models/paystack");

const createPaymentGateway = async (req, res) => {
    try {
        const user = req.user;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const reference = `PS_${crypto.randomUUID()}`;

        // Save transaction BEFORE Paystack opens modal
        const payment = await Payment.create({
            user: user._id,
            name: user.name,
            email: user.email,
            amount: amount * 100,
            reference,
        });

        console.log('payment', payment);

        return res.status(201).json({
            message: "Payment initialized",
            payment: payment.name,
            reference: payment.reference,
            amount: payment.amount,
            email: payment.email,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Payment initialization failed" });
    }
};


const verifyPayment = async (req, res) => {
    const { reference } = req.body;

    if (!reference) {
        return res.status(400).json({ message: "Reference is required" });
    }

    try {
        const payment = await Payment.findOne({ reference });

        if (!payment) {
            return res.status(404).json({ message: "Reference not found" });
        }

        if (payment.status === "PAID") {
            return res.json({ message: "Payment already verified" });
        }

        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        const data = response.data.data;

        if (data.status === "success") {
            payment.status = "PAID";
            payment.channel = data.channel;
            await payment.save();

            return res.json({ message: "Payment verified successfully" });
        }

        payment.status = "FAILED";
        await payment.save();

        return res.status(400).json({ message: "Payment failed" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Verification failed" });
    }
};


const paystackWebhook = async (req, res) => {
    const signature = crypto
        .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest("hex");

    if (signature !== req.headers["x-paystack-signature"]) {
        return res.sendStatus(401);
    }

    const event = req.body;

    if (event.event === "charge.success") {
        const reference = event.data.reference;

        await Payment.findOneAndUpdate(
            { reference },
            {
                status: "PAID",
                channel: event.data.channel,
            }
        );
    }

    res.sendStatus(200);
};

module.exports = {
    createPaymentGateway,
    verifyPayment,
    paystackWebhook,
};