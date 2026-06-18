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

// Fetch Call Recordings and Funding Info
router.get('/fetchCallRecordings', authenticateToken, async (req, res) => {
    try {
        // Fetch call recordings from external API
        let callRecordingsResponse = await axios.get('https://external-api.com/callRecordings');
        let fundingInfoResponse = await axios.get('https://external-api.com/fundingInfo');

        const callRecordings = callRecordingsResponse.data;
        const fundingInfo = fundingInfoResponse.data;

        // Create structured response
        const response = {
            callRecordings: callRecordings,
            fundingInfo: fundingInfo
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

module.exports = router;