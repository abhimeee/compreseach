const express = require('express');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Access denied. No token provided.');
    jwt.verify(token, 'YOUR_SECRET_KEY', (err, user) => {
        if (err) return res.status(403).send('Invalid token.');
        req.user = user;
        next();
    });
});

// Fetch all call recordings
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await fetch('EXTERNAL_API_URL/call-recordings');
        const data = await response.json();
        const recordings = data.recordings;
        const fundingInfo = await Promise.all(recordings.map(recording => fetchFundingInfo(recording.id)));
        const result = recordings.map((recording, index) => ({ recording, funding: fundingInfo[index] }));
        res.json(result);
    } catch (error) {
        res.status(500).send('Error fetching data.');
    }
});

// Function to fetch funding info based on recording ID
const fetchFundingInfo = async (recordingId) => {
    const response = await fetch(`EXTERNAL_API_URL/funding-info/${recordingId}`);
    return await response.json();
};

module.exports = router;