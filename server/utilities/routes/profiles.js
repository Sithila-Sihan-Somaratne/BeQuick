const express = require('express');
const router = express.Router();
const connection = require('../db/connection');
const fs = require('fs');
const path = require('path');

// Fetch user profile
router.get('/profile/:userName', (req, res) => {
    const { userName } = req.params;
    console.log(`Fetching profile for user: ${userName}`);

    const sql = 'SELECT name, email, contactNumber, dob, profileImage FROM users WHERE name = ?';
    connection.query(sql, [userName], (err, results) => {
        if (err) {
            console.error('Error while fetching user profile:', err);
            return res.status(500).json({ error: 'Error while fetching user profile' });
        } else if (results.length > 0) {
            const userProfile = results[0];
            const imagePath = path.join(__dirname, '..', 'utilities', 'images', userProfile.profileImage);
            console.log(`Reading image from path: ${imagePath}`);

            fs.readFile(imagePath, (err, data) => {
                if (err) {
                    console.error('Error reading image file:', err);
                    return res.status(500).json({ error: 'Error reading image file' });
                }
                const base64Image = `data:image/jpeg;base64,${data.toString('base64')}`;
                userProfile.profileImage = base64Image;
                return res.status(200).json(userProfile);
            });
        } else {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }
    });
});

module.exports = router;