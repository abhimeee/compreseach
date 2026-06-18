const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Fetch call recordings
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://external.api/call-recordings');
        const callRecordings = response.data;

        // Fetch funding information for each call recording
        const fundingInfoPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external.api/funding-info/${recording.id}`);
            return { ...recording, funding: fundingResponse.data };
        });

        const recordingsWithFunding = await Promise.all(fundingInfoPromises);

        res.json(recordingsWithFunding);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recordings' });
    }
});

module.exports = router;