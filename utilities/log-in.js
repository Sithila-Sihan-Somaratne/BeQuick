"use strict"
const express = require('express');
const router = express.Router();
const connection = require('./db/connection');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Environment variables should be used here
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;


//Log-in endpoint
router.post('/log-in', (req, res) => {
    const { userName, userPwd } = req.body;
    const sql = 'SELECT * FROM users WHERE name = ?';

    connection.execute(sql, [userName], (err, results) => {
        if (err) {
            console.error('Error while logging: ', err);
            res.status(500).json({ error: 'Oops! Something went wrong! Please try again later.' });
        } else {
            if (results.length === 0) {
                res.status(400).json({ message: 'Username or password doesn\'t match!' });
            } else {
                const user = results[0];
                const now = new Date();

                if (user.lock_until && now < new Date(user.lock_until)) {
                    res.status(400).json({ message: 'Account locked. Try again later.' });
                } else {
                    if (user.pwd === userPwd) {
                        connection.execute('UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE name = ?', [userName]);
                        res.status(200).json({ message: 'You successfully logged in!' });
                    } else {
                        let failedAttempts = user.failed_attempts + 1;
                        let lockUntil = null;

                        if (failedAttempts >= 5) {
                            lockUntil = new Date(now.getTime() + 5 * 60000); // 5 minutes lock
                        }

                        connection.execute('UPDATE users SET failed_attempts = ?, lock_until = ? WHERE name = ?', [failedAttempts, lockUntil, userName]);
                        res.status(400).json({ message: `Username or password doesn't match! ${5 - failedAttempts} attempts remaining!` });
                    }
                }
            }
        }
    });
});

router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    const token = crypto.randomBytes(20).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    connection.execute('UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?', [token, expiry, email], (err) => {
        if (err) {
            console.error('Error while setting reset token: ', err);
            res.status(500).json({ error: 'Oops! Something went wrong! Please try again later.' });
        } else {
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

            const mailOptions = {
                to: email,
                from: 'passwordreset@demo.com',
                subject: 'Password Reset',
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                Please click on the following link, or paste this into your browser to complete the process:\n\n
                http://localhost:3000/reset-password/${token}\n\n
                If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };

            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    console.error('Error while sending email: ', err);
                    res.status(500).json({ error: 'Oops! Something went wrong! Please try again later.' });
                } else {
                    res.status(200).json({ message: 'An e-mail has been sent to ' + email + ' with further instructions.' });
                }
            });
        }
    });
});
router.post('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    connection.execute('SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > ?', [token, new Date()], (err, results) => {
        if (err) {
            console.error('Error while verifying token: ', err);
            res.status(500).json({ error: 'Oops! Something went wrong! Please try again later.' });
        } else {
            if (results.length === 0) {
                res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
            } else {
                const user = results[0];
                connection.execute('UPDATE users SET pwd = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE email = ?', [newPassword, user.email], (err) => {
                    if (err) {
                        console.error('Error while resetting password: ', err);
                        res.status(500).json({ error: 'Oops! Something went wrong! Please try again later.' });
                    } else {
                        res.status(200).json({ message: 'Your password has been successfully reset!' });
                    }
                });
            }
        }
    });
});


module.exports = router;