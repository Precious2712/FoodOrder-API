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

        const amountInKobo = amount * 100;

        // 🔒 ALWAYS create a new reference per attempt
        const reference = `PS_${crypto.randomUUID()}`;

        const payment = await Payment.create({
            user: user._id,
            name: user.name,
            email: user.email,
            amount: amountInKobo,
            reference,
        });

        const paystackRes = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: payment.email,
                amount: payment.amount,
                reference: payment.reference,
                callback_url: `${process.env.FRONTEND_URL}/payment-success`,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        return res.status(200).json({
            authorization_url: paystackRes.data.data.authorization_url,
            reference: payment.reference,
        });

    } catch (error) {
        console.error(error.response?.data || error.message);
        return res.status(500).json({ message: "Payment initialization failed" });
    }
};


const paystackWebhook = async (req, res) => {
    const hash = crypto
        .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
        .update(req.body)
        .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
        return res.sendStatus(401);
    }

    const event = JSON.parse(req.body.toString());

    console.log('pay-stack-event', event);
    

    if (event.event === "charge.success") {
        await Payment.findOneAndUpdate(
            { reference: event.data.reference },
            {
                status: "PAID",
                channel: event.data.channel,
            }
        );
    }

    if (event.event === "charge.failed") {
        await Payment.findOneAndUpdate(
            { reference: event.data.reference },
            { status: "FAILED" }
        );
    }

    res.sendStatus(200);
};


module.exports = {
    createPaymentGateway,
    // verifyPayment,
    paystackWebhook,
};