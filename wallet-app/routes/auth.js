const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../model/user');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password} = req.body;

        // Validate if all the fields are present in the request
        if (!(email && password && first_name && last_name)) {
            return res.status(400).send('Invalid request.')
        }

        // Validate if user already exists in oud DB
        const user = await User.findOne({ email });

        if (user) {
            return res.status(409).send("User already exists. Please login.");
        }

        // encrypt the password
        const encryptedPwd = await bcrypt.hash(password, 10);

        // Create user in DB
        const newUser = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPwd
        });

        // Create token
        const token = jwt.sign(
            { user_id: newUser._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: '15m'
            }
        );
        console.log('TOKEN - ', token);

        const userObj = {
            _id: newUser._id,
            first_name,
            last_name,
            email,
            token
        }

        res.status(201).json(userObj);
    } catch (error) {
        console.log(error);
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // validate user input
    if (!(email && password)) {
        res.status(400).send('Invalid request.');
    }

    // Check if user exists or not
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
            expiresIn: "15m",
            }
        )

        const userObj = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email,
            token
        }

        res.status(200).json(userObj);
    }

    res.status(400).send("Invalid credentials");
})

module.exports = router;

