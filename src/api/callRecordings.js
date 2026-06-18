const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });
    jwt.verify(token, 'SECRET_KEY', (err, decoded) => {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
        req.userId = decoded.id;
        next();
    });
});

// API endpoint to fetch all call recordings
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://externalapi.com/call-recordings');
        const callRecordings = response.data;

        // Fetching funding info for each recording
        const fundingPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://externalapi.com/funding/${recording.fundingId}`);
            return {
                ...recording,
                fundingInfo: fundingResponse.data
            };
        });

        const recordingsWithFunding = await Promise.all(fundingPromises);
        res.status(200).json(recordingsWithFunding);
    } catch (error) {
        res.status(500).send('Error fetching call recordings.');
    }
});

module.exports = router;