const express = require('express');
const axios = require('axios');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (token) {
        jwt.verify(token, 'your-secret-key', (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Token is invalid' });
            next();
        });
    } else {
        res.status(403).json({ message: 'No token provided' });
    }
});

// API endpoint to fetch call recordings
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external.api/call-recordings');
        const callRecordings = response.data;

        // Assuming funding information is present in the response structure
        const fundingInfo = await Promise.all(callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external.api/funding/${recording.fundingId}`);
            return fundingResponse.data;
        }));

        // Structuring response
        const structuredResponse = callRecordings.map((recording, index) => ({
            recording,
            funding: fundingInfo[index]
        }));

        res.status(200).json(structuredResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data', error: error.message });
    }
});

module.exports = router;