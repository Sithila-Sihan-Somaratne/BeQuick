"use strict"
const express = require('express');
const router = express.Router();
const connection = require('./db/connection');

//Log-in endpoint
router.post('/log-in', (req, res) => {
    const { userName, userPwd } = req.body;
    const sql = 'SELECT * FROM users WHERE name = ? AND pwd = ?';

    connection.execute(sql, [userName, userPwd], (err, results) => {
        if(err){
            console.error('Error while searching for data:', err);
            res.status(500).json({ error: 'Make sure that user name and password are correct' });
        }else{
            console.log('User found! Successfully logged in!', results);
            res.status(200).json({ message: 'You successfully logged in!' });
        }
    });

});

module.exports = router;