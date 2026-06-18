const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
        if (err) return res.sendStatus(403);
        next();
    });
};

// Endpoint to fetch call recordings
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call-recordings'); // Replace with actual external API
        const callRecordings = response.data;

        const fundingInfo = await Promise.all(callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.com/funding/${recording.id}`); // Replace with actual funding API
            return fundingResponse.data;
        }));

        const formattedResponse = callRecordings.map((recording, index) => ({
            recording,
            funding: fundingInfo[index]
        }));

        res.json(formattedResponse);
    } catch (error) {
        console.error('Error fetching call recordings or funding info:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;