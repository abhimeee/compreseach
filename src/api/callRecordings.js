const express = require('express');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const router = express.Router();
const EXTERNAL_API_URL = 'https://externalapi.com/callRecordings';
const fundingApiUrl = 'https://externalapi.com/fundingInfo';
const SECRET_KEY = 'your-secret-key';

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Fetch all call recordings and their associated funding info
router.get('/api/call-recordings', authenticateToken, async (req, res) => {
    try {
        const response = await fetch(EXTERNAL_API_URL);
        const callRecordings = await response.json();

        // Fetch funding information for each call recording
        const fundingPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await fetch(`${fundingApiUrl}/${recording.id}`);
            const fundingInfo = await fundingResponse.json();
            return {
                recording,
                fundingInfo
            };
        });

        const results = await Promise.all(fundingPromises);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch call recordings' });
    }
});

module.exports = router;