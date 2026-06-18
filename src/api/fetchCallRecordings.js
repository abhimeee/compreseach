const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Fetch call recordings and funding info
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://external.api/callRecordings');
        const callRecordings = response.data;

        // Fetch funding information for each recording
        const fundingPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external.api/funding/${recording.fundingId}`);
            return {
                ...recording,
                funding: fundingResponse.data
            };
        });

        const recordingsWithFunding = await Promise.all(fundingPromises);
        res.json(recordingsWithFunding);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching call recordings or funding info');
    }
});

module.exports = router;