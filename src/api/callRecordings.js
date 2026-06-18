const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Access denied. No token provided.');
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).send('Invalid token.');
        req.user = decoded;
        next();
    });
});

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external-api.example.com/call-recordings');

        // Assume the response contains an array of recordings
ing calls and their funding information
        const recordings = response.data;
        const result = recordings.map(recording => ({
            callRecording: recording,
            fundingInfo: recording.funding // Assuming funding is a field in the recording
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching call recordings:', error);
        res.status(500).send('Error fetching data from external API.');
    }
});

module.exports = router;