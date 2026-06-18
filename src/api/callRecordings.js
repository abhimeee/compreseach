const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Fetch call recordings
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call-recordings');
        const callRecordings = response.data;

        // Fetch funding info for each call
        const fundingPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.com/funding/${recording.id}`);
            return { ...recording, funding: fundingResponse.data };
        });

        const callRecordingsWithFunding = await Promise.all(fundingPromises);

        res.json({ recordings: callRecordingsWithFunding });
    } catch (error) {
        console.error('Error fetching call recordings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;