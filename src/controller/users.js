const Users = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id, email) => {
    return jwt.sign({ id, email }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_TIMEOUT
    })
}

const createUser = async (req, res) => {
    const { name, email, password, age, gender } = req.body;

    try {
        if (!name || !email || !password || !age) {
            return res.json({
                message: 'All fields are required'
            })
        }

        if (!['Male', 'Female'].includes(gender)) {
            return res.status(400).json({
                message: 'Gender must be Male or Female'
            });
        }


        const salt = await bcrypt.genSalt(10);

        const harshPassword = await bcrypt.hash(password, salt);

        const user = {
            name,
            email,
            password: harshPassword,
            age,
            gender
        }

        const authUser = await Users.create(user);
        console.log('AuthUser', authUser);

        res.status(200).json({
            message: 'User document created',
            status: true,
            authUser
        })

    } catch (error) {
        console.log('An error has occur', error.message);
        res.status(501).json({
            message: 'An error has occur',
            err: error
        })
    }
}

const signInUsers = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({
            message: 'Email and password are required'
        })
    }

    try {
        const userRef = await Users.findOne({
            email
        })

        if (!userRef) {
            return res.json({
                message: 'Invalid crendential used'
            })
        }

        const isMatch = await bcrypt.compare(password, userRef.password);

        if (!isMatch) {
            return res.json({
                message: 'Invalid crendential used'
            })
        }

        const token = generateToken(userRef._id, userRef.email)

        res.status(201).json({
            message: 'User login successful',
            email: userRef.email,
            age: userRef.age,
            gender: userRef.gender,
            name: userRef.name,
            id: userRef._id,
            token
        })

    } catch (error) {
        console.log('An error has occur', error.message);
        res.status(501).json({
            message: 'An error has occur',
            err: error
        })
    }
}

module.exports = {
    createUser,
    signInUsers
}