"use strict"
require('dotenv').config();
const express = require('express');
const router = express.Router();
const cors = require('cors');
const signUp = require('./utilities/sign-up');
const logIn = require("./utilities/log-in");
console.log(process.env) // remove this after you've confirmed it is working

//Creating an Express application
const app = express();

//Use CORS
app.use(cors());

// Middleware to parse JSON data
app.use(express.json());

//Routes
app.use('', signUp);
app.use('', logIn);

// Fetch user profile
router.get('/profile/:userName', (req, res) => {
    const { userName } = req.params;
    const sql = 'SELECT name, email, contactNumber, dob, profileImage FROM users WHERE name = ?';
    connection.query(sql, [userName], (err, results) => {
        if (err) {
            console.error('Error while fetching user profile:', err);
            return res.status(500).json({ error: 'Error while fetching user profile' });
        } else if (results.length > 0) {
            return res.status(200).json(results[0]);
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    });
});

// Initializing server
app.listen(3000, "localhost", () => {
    console.log("Server is running on port 3000");
});
