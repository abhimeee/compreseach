const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(403).send('Access denied. No token provided.');

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) return res.status(401).send('Invalid token.');
        next();
    });
});

// API endpoint to fetch call recordings and corresponding funding info
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call-recordings'); // Replace with actual external API
        const callRecordings = response.data;

        // Fetch funding info for each call recording
        const fundingPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.com/funding/${recording.id}`); // Replace with actual endpoint
            return {
                ...recording,
                funding: fundingResponse.data,
            };
        });

        const recordingsWithFunding = await Promise.all(fundingPromises);

        // Structure response to return separate entities
        const responseData = {
            callRecordings: recordingsWithFunding,
            fundingInfo: recordingsWithFunding.map(r => r.funding),
        };

        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).send('Internal server error.');
    }
});

module.exports = router;