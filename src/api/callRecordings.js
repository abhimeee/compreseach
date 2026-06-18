const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Access denied. No token provided.');
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send('Invalid token.');
        req.user = decoded;
        next();
    });
});

// Fetch all call recordings and their funding info
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external-api.example.com/call-recordings');
        const callRecordings = response.data.recordings;

        const fundingInfoPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.example.com/funding/${recording.id}`);
            return { ...recording, funding: fundingResponse.data };
        });

        const callRecordingsWithFunding = await Promise.all(fundingInfoPromises);
        res.json({ recordings: callRecordingsWithFunding });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching call recordings.');
    }
});

module.exports = router;