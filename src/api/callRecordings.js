const express = require('express');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('A token is required for authentication');
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(401).send('Invalid Token');
        }
        req.user = user;
        next();
    });
});

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await fetch('https://external-api.example.com/call-recordings');
        const data = await response.json();
        const recordings = data.recordings;

        const fundingInfoPromises = recordings.map(async (recording) => {
            const fundingResponse = await fetch(`https://external-api.example.com/funding/${recording.id}`);
            const fundingData = await fundingResponse.json();
            return { ...recording, funding: fundingData };
        });

        const recordingsWithFunding = await Promise.all(fundingInfoPromises);
        res.status(200).json({ recordings: recordingsWithFunding });
    } catch (error) {
        res.status(500).send('Error fetching call recordings');
    }
});

module.exports = router;