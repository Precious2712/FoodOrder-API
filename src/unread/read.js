require("dotenv").config();

const UserOrder = require("../models/user-order");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

transporter.verify((error) => {
    if (error) {
        console.error("❌ Error verifying transporter:", error);
    } else {
        console.log("✅ Server is ready to send emails");
    }
});

const createGallery = async (req, res) => {
    try {
        const userId = req.user._id;
        const ownerEmail = req.user.email;

        
        const order = await UserOrder.findOne({ userId: userId });

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        if (!order.items || order.items.length === 0) {
            return res.status(400).json({
                message: "Order has no items",
            });
        }

        const payload = {
            user: userId,
            email: ownerEmail,
            sum: order.grandTotal,
        };

        for (const [key, value] of Object.entries(payload)) {
            if (value === undefined || value === null || value === "") {
                return res.status(400).json({
                    message: `${key} is required`,
                });
            }
        }

        
        const itemsHtml = order.items
            .map((item) => `
                <div class="item-card">
                    <img 
                        src="${item.image}" 
                        alt="${item.itemName}"
                        class="item-image"
                    />
                    <div class="item-details">
                        <h3 style="margin: 0 0 8px 0;">${item.itemName}</h3>
                        <p style="margin: 5px 0;"><strong>Price:</strong> ₦${item.itemPrice}</p>
                        <p style="margin: 5px 0;"><strong>Quantity:</strong> ${item.quantity}</p>
                        <p style="margin: 5px 0;"><strong>Item Total:</strong> ₦${item.total}</p>
                    </div>
                </div>
            `)
            .join("");

       
        await transporter.sendMail({
            from: `"Punch Digital" <${process.env.GMAIL_USER}>`,
            to: ownerEmail,
            subject: "Summary of Item Purchase",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Purchase Summary</title>
                    <style>
                        /* (UNCHANGED STYLES — KEPT AS IS) */
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
                                <h1>₦${payload.sum}</h1>
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
            message: "Gallery created & email sent successfully",
        });

    } catch (error) {
        console.error("CREATE GALLERY ERROR:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};


module.exports = {
    createGallery,
};