const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// API endpoint for fetching call recordings and their funding info
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call-recordings');
        const callRecordings = response.data;
        const fundingInfo = await Promise.all(
            callRecordings.map(async (recording) => {
                const fundingResponse = await axios.get(`https://external-api.com/funding/${recording.id}`);
                return fundingResponse.data;
            })
        );

        // Structuring response
        const structuredResponse = callRecordings.map((recording, index) => ({
            recording,
            funding: fundingInfo[index]
        }));

        res.status(200).json(structuredResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;