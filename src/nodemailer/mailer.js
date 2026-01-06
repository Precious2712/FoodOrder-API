const nodemailer = require("nodemailer");
const UserOrder = require('../models/user-order');


const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});


const sendOrderEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                message: "Invalid email address format",
            });
        }

        const userId = req.user._id;

        const goods = await UserOrder.findOne({ userId });

        if (!goods) {
            return res.status(404).json({
                message: "No order found for this user",
            });
        }

        
        if (!goods.items || goods.items.length === 0) {
            return res.status(400).json({
                message: "No items in the order",
            });
        }

        const grandTotal = goods.grandTotal;

        
        const itemsHtml = goods.items
            .map(
                (item) => `
                <div class="item-card">
                    <img src="${item.image}" class="item-image" />
                    <div class="item-details">
                        <strong>${item.itemName}</strong><br/>
                        ₦${item.itemPrice} × ${item.quantity} = ₦${item.total}
                    </div>
                </div>
            `
            )
            .join("");

        await transporter.sendMail({
            from: `"Punch Digital" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Summary of Item Purchase",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Purchase Summary</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 20px;
                            background-color: #f4f4f4;
                        }
                        .email-container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background-color: #4F46E5;
                            color: white;
                            padding: 25px 30px;
                            text-align: center;
                        }
                        .content {
                            padding: 30px;
                        }
                        .item-list {
                            max-height: 400px;
                            overflow-y: auto;
                            border: 1px solid #e1e1e1;
                            border-radius: 8px;
                            padding: 15px;
                            margin: 20px 0;
                            background-color: #f9f9f9;
                        }
                        .item-card {
                            display: flex;
                            align-items: center;
                            padding: 15px;
                            border-bottom: 1px solid #eee;
                            background-color: white;
                            border-radius: 6px;
                            margin-bottom: 10px;
                        }
                        .item-card:last-child {
                            border-bottom: none;
                            margin-bottom: 0;
                        }
                        .item-image {
                            width: 80px;
                            height: 80px;
                            object-fit: cover;
                            border-radius: 6px;
                            margin-right: 15px;
                        }
                        .item-details {
                            flex: 1;
                        }
                        .total-section {
                            background-color: #f0f9ff;
                            padding: 20px;
                            border-radius: 8px;
                            margin-top: 25px;
                            text-align: center;
                            border-left: 4px solid #4F46E5;
                        }
                        .footer {
                            text-align: center;
                            padding: 20px;
                            color: #666;
                            font-size: 14px;
                            border-top: 1px solid #eee;
                            background-color: #f9f9f9;
                        }
                        .thank-you {
                            color: #4F46E5;
                            font-size: 28px;
                            margin-bottom: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>Punch Digital</h1>
                            <p>Your Digital Purchase Summary</p>
                        </div>

                        <div class="content">
                            <h2 class="thank-you">Thank you for your purchase! 🎉</h2>

                            <div class="item-list">
                                ${itemsHtml}
                            </div>

                            <div class="total-section">
                                <h2 style="color: #4F46E5;">Grand Total</h2>
                                <h1>₦${grandTotal}</h1>
                            </div>
                        </div>

                        <div class="footer">
                            <p>© ${new Date().getFullYear()} Punch Digital. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });
        
        return res.status(200).json({
            success: true,
            message: "Email sent successfully",
            emailSentTo: email
        });

    } catch (error) {
        console.error("Email sending error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send email",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    sendOrderEmail
};