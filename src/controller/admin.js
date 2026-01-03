const Admin = require('../models/admin');
const Paystack = require('../models/paystack');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateAdminToken = ({ id, email }) => {
    return jwt.sign({ id, email }, process.env.ADMIN_SECRET_KEY, {
        expiresIn: process.env.JWT_ADMIN
    });
};


const createAdmin = async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({
                message: "Please provide email, password, and full name"
            });
        }

        // const existingAdmin = await Admin.findOne({ email });
        // if (existingAdmin) {
        //     return res.status(409).json({
        //         message: "Admin with this email already exists"
        //     });
        // }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const registerAdmin = await Admin.create({
            email,
            password: hashedPassword,
            fullName
        })

        return res.status(201).json({
            message: "Admin created successfully",
            registerAdmin
        });

    } catch (error) {
        console.error("Sign Up Error:", error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const logAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = generateAdminToken({
            id: admin._id,
            email: admin.email
        });

        return res.status(200).json({
            message: "Sign in successful",
            email: admin._id,
            password: admin.email,
            fullName: admin.fullName,
            token
        });

    } catch (error) {
        console.error("Sign In Error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const getProfile = async (req, res) => {
    try {
        const adminId = req.admin;

        const admin = await Admin.findById(adminId).select('-password');
        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        return res.status(200).json({
            admin
        });

    } catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const getALLPayment = async (req, res) => {
    try {
        const userPayment = await Paystack.find();

        if (!userPayment) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        res.status(201).json({
            mesage: 'Document found',
            userPayment
        })
    } catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


module.exports = {
    createAdmin,
    logAdmin,
    getProfile,
    getALLPayment
};