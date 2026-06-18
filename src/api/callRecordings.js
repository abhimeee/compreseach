const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // Assuming JWT for token-based auth

const router = express.Router();

// Middleware for token authentication
router.use((req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send('A token is required for authentication');

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) return res.status(401).send('Invalid Token');
        next();
    });
});

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call-recordings'); // External API URL
        const callRecordings = response.data;

        // Fetch funding info for each call recording
        const fundingInfoPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.com/funding-info/${recording.id}`);
            return { recording, funding: fundingResponse.data };
        });

        const structuredResponses = await Promise.all(fundingInfoPromises);
        res.json(structuredResponses);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;