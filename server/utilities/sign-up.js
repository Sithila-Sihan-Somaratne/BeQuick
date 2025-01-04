"use strict"
const express = require('express');
const router = express.Router();
const connection = require('./db/connection');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

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

//Encrypt password method
function encryptPassword (password) {
    const saltRounds = 12;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

// Sign-up endpoint
router.post('/sign-up', (req, res) => {
    const { userName, userEmail, userContact, userDOB, userPwd} = req.body;
    if (!userName || !userEmail || !userContact || !userDOB || !userPwd ) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const encryptedPwd = encryptPassword(userPwd);
    const verificationPin = crypto.randomInt(100000, 1000000).toString();
    const isVerified = 0;

    console.log("Register password: "+userPwd);
    console.log("Encrypted above pwd: "+encryptedPwd);
    
    
    const sql = 'INSERT INTO users (name, email, contactNumber, dob, pwd, verificationPin, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const userValues = [userName, userEmail, userContact, userDOB, encryptedPwd, verificationPin, isVerified];

    connection.execute(sql, userValues, (err, _results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error while inserting data' });
        } else {
            sendEmail(userEmail, userName, verificationPin, (emailError) => {
                if (emailError) {
                    return res.status(500).json({ message: 'Something went wrong while sending email' });
                } else {
                    return res.status(200).json({ message: 'User has been created successfully! Now check your email to insert PIN below' });
                }
            });
        }
    });
});

// Verify PIN
router.post('/verify-pin', (req, res) => {
    const { userName ,verificationPin } = req.body;
    const sql = 'SELECT * FROM users WHERE name = ? AND verificationPin = ?';
    connection.query(sql, [userName, verificationPin], (err, results) => {
        console.log(sql, userName, verificationPin);
        console.log(results.length);
        if (err) {
            console.error('Error while verifying PIN:', err);
            return res.status(500).json({ error: 'Error while verifying PIN' });
        } else if (results.length > 0) {
            // PIN is correct, update the isVerified field for the user
            const updateSql = 'UPDATE users SET isVerified = 1 WHERE name = ?';
            connection.query(updateSql, [userName], (updateErr, updateResults) => {
                if (updateErr) {
                    console.error('Error while updating verification status:', updateErr);
                    return res.status(500).json({ error: 'Error while updating verification status' });
                } else {
                    console.log('User verified:', updateResults);
                    return res.status(200).json({ message: 'User has been verified successfully! Now you can log in.' });
                }
            });
        } else {
            // PIN is incorrect
            return res.status(401).json({ message: 'Incorrect PIN. Make sure you first copy and paste in the field from the email we sent you.' });
        }
    });
});

let sendEmail = (usrEmail, usrName, verifyPin, callback) => {
    const mailOptions = {
        from: emailUser,
        to: usrEmail,
        subject: 'Verify Your Account',
        text: `Hello ${usrName},\n\nWelcome to BeQuick!\n\nYour verification PIN is ${verifyPin}. Please enter this PIN to verify your account.\n\nThank you!\nBeQuick Company.`
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
