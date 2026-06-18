const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to authenticate token' });
        next();
    });
});

// Endpoint to fetch call recordings
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call-recordings');
        const callRecordings = response.data;

        // Process each recording to fetch related funding info
        const results = await Promise.all(callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.com/funding-info/${recording.id}`);
            return {  
                recording,
                funding: fundingResponse.data
            };
        }));

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch call recordings' });
    }
});

module.exports = router;