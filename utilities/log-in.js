"use strict";
const express = require('express');
const router = express.Router();
const connection = require('./db/connection');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Environment variables should be used here
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

// Log-in endpoint
router.post('/log-in', (req, res) => {
    const { userName, userPwd } = req.body;
    const sql = 'SELECT * FROM users WHERE name = ?';

    connection.execute(sql, [userName], (err, results) => {
        if (err) {
            console.error('Error while logging: ', err);
            return res.status(500).json({ error: 'Oops! Something went wrong! Please try again later.' });
        } else {
            if (results.length === 0) {
                return res.status(400).json({ message: 'Username or password doesn\'t match!' });
            } else {
                const user = results[0];
                const now = new Date();

                if (user.lock_until && now < new Date(user.lock_until)) {
                    return res.status(400).json({ message: `Account locked. Try again later. Account will be unlocked at ${user.lock_until}`});
                } else {
                    console.log(user.pwd);
                    console.log(userPwd);
                    if (bcrypt.compareSync(userPwd, user.pwd)) {
                        connection.execute('UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE name = ?', [userName]);
                        return res.status(200).json({ message: 'You successfully logged in!' });
                    }
                     else {
                        let failedAttempts = user.failed_attempts + 1;
                        let lockUntil = null;

                        if (failedAttempts >= 5) {
                            lockUntil = new Date(now.getTime() + 5 * 60000); // 5 minutes lock
                        }

                        connection.execute('UPDATE users SET failed_attempts = ?, lock_until = ? WHERE name = ?', [failedAttempts, lockUntil, userName]);
                        return res.status(400).json({ message: `Username or password doesn't match! ${5 - failedAttempts} attempts remaining!` });
                    }
                }
            }
        }
    });
});

// Forgot password endpoint
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    const token = crypto.randomBytes(20).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    connection.execute('UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?', [token, expiry, email], (err) => {
        if (err) {
            console.error('Error while setting reset token: ', err);
            return res.status(500).json({ error: 'Oops! Something went wrong! Please try again later.' });
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
                from: emailUser,
                subject: 'Password Reset',
                text: `Hello.\nYou are receiving this because you (or someone else) have requested the reset of the password for your account.\nYour password reset token is: ${token}\nIf you did not request this, please ignore this email and your password will remain unchanged.\nIf you have request wait for a modal to appear to insert token and reset you passrord. Note that the token expires within 1 hour.\n\nThank you for reading the instructions.\nBeQuick Company.`
            };

            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    console.error('Error while sending email: ', err);
                    return res.status(500).json({ error: 'Oops! Something went wrong! Please try again later.' });
                } else {
                    return res.status(200).json({ message: 'An e-mail has been sent to ' + email + ' with further instructions.' });
                }
            });
        }
    });
});

// Reset password endpoint
router.post('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    connection.execute('SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > ?', [token, new Date()], (err, results) => {
        if (err) {
            console.error('Error while verifying token: ', err);
            return res.status(500).json({ error: 'Oops! Something went wrong! Please try again later.' });
        } else {
            if (results.length === 0) {
                return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
            } else {
                const user = results[0];
                connection.execute('UPDATE users SET pwd = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE email = ?', [newPassword, user.email], (err) => {
                    if (err) {
                        console.error('Error while resetting password: ', err);
                        return res.status(500).json({ error: 'Oops! Something went wrong! Please try again later.' });
                    } else {
                        return res.status(200).json({ message: 'Your password has been successfully reset!' });
                    }
                });
            }
        }
    });
});

module.exports = router;