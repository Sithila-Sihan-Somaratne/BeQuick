"use strict"
const mysql = require('mysql2');

//MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2010',
    database: 'bequick'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to the MySQL server.');
});

module.exports = connection;