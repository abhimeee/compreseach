const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Endpoint to fetch call recordings
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        // Fetch call recordings
        const response = await axios.get('https://externalapi.com/callrecordings');
        const callRecordings = response.data;
        const fundingInfoPromises = callRecordings.map(recording =>
            axios.get(`https://externalapi.com/funding/${recording.id}`)
        );

        // Fetch funding information for each recording
        const fundingInfos = await Promise.all(fundingInfoPromises);

        // Structure the response
        const result = callRecordings.map((recording, index) => ({
            recording,
            fundingInfo: fundingInfos[index].data
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch call recordings and funding info.' });
    }
});

module.exports = router;