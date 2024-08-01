"use strict"
const express = require('express');
const router = express.Router();
const connection = require('./db/connection');
const crypto = require('crypto-js');
const nodemailer = require('nodemailer');

// Environment variables should be used here
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

// Configure the email transport using the default SMTP transport and your email account details
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: emailUser, // Your email address
        pass: emailPass // Your email password
    },
    tls: {
        rejectUnauthorized: true,
    }
});

// Sign-up endpoint
router.post('/sign-up', (req, res) => {
    console.log("POST executing...");
    const { userName, userEmail, userContact, userPwd } = req.body;
    const verificationPin = crypto.randomInt(100000, 1000000).toString();
    const isVerified = 0;

    const sql = 'INSERT INTO users (userName, userEmail, userContact, userPwd, verificationPin, isVerified) VALUES (?, ?, ?, ?, ?, ?)';
    const userValues = [userName, userEmail, userContact, userPwd, verificationPin, isVerified];

    connection.execute(sql, userValues, (err, results) => {
        if (err) {
            console.error(err);
            console.error('Error while inserting data:', err);
            res.status(500).json({ error: 'Error while inserting data' });
        } else {
            console.log(results);
            console.log('User created:', results);
            sendEmail(userEmail, userName, verificationPin, (emailError) => {
                console.log(`User: ${process.env.EMAIL_USER}`);
                console.log(`Pass: ${process.env.EMAIL_PASS}`);

                if (emailError) {
                    res.status(500).json({ message: 'Something went wrong while sending email' });
                } else {
                    res.status(200).json({ message: 'User has been created successfully! Now check your email to insert PIN below' });
                }
            });
        }
    });
});
//Verify PIN
router.post('/verify-pin', (req, res) => {
    const { userName, verificationPin } = req.body;
    const sql = 'SELECT * FROM users WHERE userName = ? AND verificationPin = ?';

    connection.query(sql, [userName, verificationPin], (err, results) => {
        if (err) {
            console.error('Error while verifying PIN:', err);
            res.status(500).json({ error: 'Error while verifying PIN' });
        } else if (results.length > 0) {
            // PIN is correct, update the isVerified field for the user
            const updateSql = 'UPDATE users SET isVerified = 1 WHERE userName = ?';
            connection.query(updateSql, [userName], (updateErr, updateResults) => {
                if (updateErr) {
                    console.error('Error while updating verification status:', updateErr);
                    res.status(500).json({ error: 'Error while updating verification status' });
                } else {
                    console.log('User verified:', updateResults);
                    res.status(200).json({ message: 'User has been verified successfully! Now you can log in.' });
                }
            });
        } else {
            // PIN is incorrect
            res.status(401).json({ message: 'Incorrect PIN' });
        }
    });
});
let sendEmail = (usrEmail, usrName, verifyPin, callback) => {
    const mailOptions = {
        from: emailUser,
        to: usrEmail,
        subject: 'Verify Your Account',
        text: `Hello ${usrName},\n\nWelcome to BeQuick!\n\nYour verification PIN is ${verifyPin}. Please enter this PIN to verify your account.\n\nThank you!\n\nSithila Sihan Somaratne, owner of BeQuick`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            callback(error, null);
        } else {
            console.log('Email sent:', info.response);
            callback(null, info.response);
        }
    });
};

module.exports = router;