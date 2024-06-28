"use strict"
require('dotenv').config();
const mysql = require('mysql2');

//MySQL connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to the MySQL server.');
});

module.exports = connection;