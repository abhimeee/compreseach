const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Access denied. No token provided.');
    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) return res.status(403).send('Invalid token.');
        req.user = user;
        next();
    });
});

// Fetch call recordings and funding info
router.get('/call-recordings', async (req, res) => {
    try {
        // Fetch call recordings
        const recordingsResponse = await axios.get('https://externalAPI.com/callRecordings');
        const recordings = recordingsResponse.data;

        // Fetch funding information for each recording
        const fundingPromises = recordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://externalAPI.com/funding/${recording.id}`);
            return fundingResponse.data;
        });

        const fundingInfos = await Promise.all(fundingPromises);

        // Structure response
        const response = recordings.map((recording, index) => ({
            recording,
            funding: fundingInfos[index]
        }));

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;