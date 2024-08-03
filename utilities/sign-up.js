"use strict"
const express = require('express');
const router = express.Router();
const connection = require('./db/connection');
const crypto = require('crypto');
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
    const { userName, userEmail, userContact, userDOB, userPwd, bankName, bankAccountNumber, bankSWIFT } = req.body;
    if (!userName || !userEmail || !userContact || !userDOB || !userDOB || !bankName || !bankAccountNumber || !bankSWIFT) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const verificationPin = crypto.randomInt(100000, 1000000).toString();
    const isVerified = 0;

    const sql = 'INSERT INTO users (name, email, contactNumber, dob, pwd, verificationPin, bankName, bankAccountNumber, bankSWIFT, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const userValues = [userName, userEmail, userContact, userDOB, userPwd, verificationPin, bankName, bankAccountNumber, bankSWIFT, isVerified];

    connection.execute(sql, userValues, (err, _results) => {
        if (err) {
            res.status(500).json({ error: 'Error while inserting data' });
        } else {
            sendEmail(userEmail, userName, verificationPin, (emailError) => {
                if (emailError) {
                    res.status(500).json({ message: 'Something went wrong while sending email' });
                } else {
                    res.status(200).json({ message: 'User has been created successfully! Now check your email to insert PIN below' });
                }
            });
        }
    });
});

// Verify PIN
router.post('/verify-pin', (req, res) => {
    const { name, verificationPin } = req.body;
    const sql = 'SELECT * FROM users WHERE name = ? AND verificationPin = ?';

    connection.query(sql, [name, verificationPin], (err, results) => {
        if (err) {
            console.error('Error while verifying PIN:', err);
            res.status(500).json({ error: 'Error while verifying PIN' });
        } else if (results.length > 0) {
            // PIN is correct, update the isVerified field for the user
            const updateSql = 'UPDATE users SET isVerified = 1 WHERE name = ?';
            connection.query(updateSql, [name], (updateErr, updateResults) => {
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
            console.error('Error while sending email:', error);
            callback(error, null);
        } else {
            console.log('Email sent:', info.response);
            callback(null, info.response);
        }
    });
};

module.exports = router;
