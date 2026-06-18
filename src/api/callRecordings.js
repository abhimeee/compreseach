const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Access denied. No token provided.');

    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) return res.status(403).send('Invalid token.');
        req.user = decoded;
        next();
    });
});

// Endpoint to fetch call recordings
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call_recordings');
        const callRecordings = response.data;

        // Fetch funding information related to each call recording
        const fundingPromises = callRecordings.map(recording => {
            return axios.get(`https://external-api.com/funding/${recording.id}`);
        });

        const fundingResponses = await Promise.all(fundingPromises);
        const fundingInfo = fundingResponses.map(funding => funding.data);

        // Structure response with separate entities
        const structuredResponse = callRecordings.map((recording, index) => ({
            recording,
            funding: fundingInfo[index]
        }));

        res.status(200).json(structuredResponse);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;