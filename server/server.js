"use strict"
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const signUp = require('./utilities/routes/sign-up');
const logIn = require("./utilities/routes/log-in");
const profileRoute = require("./utilities/routes/profiles");

// Creating an Express application
const app = express();

// Use CORS
app.use(cors());

// Middleware to parse JSON data
app.use(express.json()); 

// Routes
app.use('', signUp);
app.use('', logIn);
app.use('/profile', profileRoute); 

// Initializing server
app.listen(3000, "localhost", () => {
    console.log("Server is running on port 3000");
});