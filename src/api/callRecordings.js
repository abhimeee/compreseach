const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('No token provided.');
    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) return res.status(500).send('Failed to authenticate token.');
        req.userId = decoded.id;
        next();
    });
});

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', async (req, res) => {
    try {
        const recordingsResponse = await axios.get('https://externalapi.com/callRecordings');
        const fundingResponse = await axios.get('https://externalapi.com/fundingInfo');

        const recordings = recordingsResponse.data;
        const fundingInfo = fundingResponse.data;

        const response = recordings.map(recording => {
            const funding = fundingInfo.find(f => f.recordingId === recording.id);
            return {
                recording: recording,
                funding: funding
            };
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send('Error fetching data');
    }
});

module.exports = router;