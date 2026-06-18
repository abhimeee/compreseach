const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token verification
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// API Endpoint to fetch call recordings and funding info
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        // Fetch Call Recordings
        const recordingsResponse = await axios.get('https://external-api.com/call-recordings');
        const recordings = recordingsResponse.data;

        // Fetch Funding Info related to each recording
        const fundedRecordings = await Promise.all(recordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.com/funding/${recording.fundingId}`);
            return {
                ...recording,
                fundingInfo: fundingResponse.data,
            };
        }));

        res.status(200).json(fundedRecordings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

module.exports = router;