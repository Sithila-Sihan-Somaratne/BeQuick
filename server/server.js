"use strict"
require('dotenv').config();
const express = require('express');
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

// Initializing server
app.listen(3000, "localhost", () => {
    console.log("Server is running on port 3000");
});
