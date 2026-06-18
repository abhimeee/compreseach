const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // Assuming JWT for token-based auth

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Access Denied');
    try {
        const verified = jwt.verify(token, 'YOUR_SECRET_KEY'); // Use your secret key
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});

// Endpoint to fetch call recordings and associated funding information
router.get('/fetchCallRecordings', async (req, res) => {
    try {
        const recordingsResponse = await axios.get('https://externalapi.com/callRecordings'); // Replace with actual API
        const fundingInfoResponse = await axios.get('https://externalapi.com/fundingInfo'); // Replace with actual API

        const recordings = recordingsResponse.data;
        const fundingInfo = fundingInfoResponse.data;

        // Assuming recordings and fundingInfo can be matched by an ID
        const structuredResponse = recordings.map(recording => ({
            recording: recording,
            funding: fundingInfo.find(fund => fund.recordingId === recording.id) // Replace with actual matching logic
        }));

        res.json(structuredResponse);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;