"use strict"
const express = require('express');
const cors = require('cors');
const signUp = require('./utilities/sign-up');
//Creating an Express application
const app = express();

//Use CORS
app.use(cors());

// Middleware to parse JSON data
app.use(express.json());

//Routes
app.use('/sign-up', signUp);

// Initializing server
app.listen(3000, "localhost", () => {
    console.log("Server is running on port 3000");
});
