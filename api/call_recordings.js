const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // Assuming JWT for token-based authentication

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }
        req.userId = decoded.id; // Store user id from token
        next();
    });
});

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://externalapi.com/call_recordings'); // Replace with actual external API
        const callRecordings = response.data;
        const fundingResponses = await Promise.all(callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://externalapi.com/funding/${recording.id}`);
            return fundingResponse.data;
        }));

        const structuredResponse = callRecordings.map((recording, index) => ({
            recording,
            fundingInfo: fundingResponses[index]
        }));

        return res.json(structuredResponse);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch call recordings or funding info' });
    }
});

module.exports = router;