const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const router = express.Router();

// Middleware for token-based authentication
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// API endpoint for fetching call recordings
router.get('/callRecordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/callRecordings');

        const recordings = response.data.recordings;

        const fundingDetails = await Promise.all(recordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.com/fundingDetails/${recording.id}`);
            return fundingResponse.data;
        }));

        const result = recordings.map((recording, index) => ({
            recording,
            funding: fundingDetails[index]
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch call recordings or funding details.' });
    }
});

module.exports = router;