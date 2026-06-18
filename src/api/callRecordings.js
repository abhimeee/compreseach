const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(403); // Forbidden
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
}

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const recordingsResponse = await axios.get('https://external-api.com/call-recordings');
        const fundingResponse = await axios.get('https://external-api.com/funding-info');

        const recordings = recordingsResponse.data;
        const funding = fundingResponse.data;

        // Structure the response
        const response = recordings.map(recording => {
            return {
                recordingId: recording.id,
                recordingUrl: recording.url,
                fundingInfo: funding.find(fund => fund.recordingId === recording.id)
            };
        });

        res.json(response);
    } catch (error) {
        console.error(error);
        res.sendStatus(500); // Internal Server Error
    }
});

module.exports = router;