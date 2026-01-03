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

        let payment = await Payment.findOne({
            user: user._id,
            amount: amountInKobo,
            status: "PENDING",
        });

        if (!payment) {
            const reference = `PS_${crypto.randomUUID()}`;

            payment = await Payment.create({
                user: user._id,
                name: user.name,
                email: user.email,
                amount: amountInKobo,
                reference,
                status: "PENDING",
            });
        }

        // 2️⃣ Initialize Paystack transaction
        const paystackRes = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: payment.email,
                amount: payment.amount,
                reference: payment.reference,
                callback_url: `${process.env.FRONTEND_URL}/payment-success`, // or success page
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log('paystackRes', paystackRes);
        console.log('payment-gateway', payment);

        // 3️⃣ Return Paystack payment URL
        return res.status(200).json({
            authorization_url: paystackRes.data.data.authorization_url,
            reference: payment.reference,
        });

    } catch (error) {
        console.error(error.response?.data || error.message);
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
            },
            { new: true }
        );
    }

    if (event.event === 'charge.failed') {
        await Payment.findOneAndUpdate(
            { reference },
            { status: "FAILED" }
        )
    }

    res.sendStatus(200);
};

module.exports = {
    createPaymentGateway,
    verifyPayment,
    paystackWebhook,
};