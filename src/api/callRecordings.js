'use strict';

const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
        if (err) return res.sendStatus(403);
        next();
    });
}

// Fetch call recordings and funding information
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        // Replace with the actual API URL for call recordings
        const response = await axios.get('https://externalapi.com/call-recordings');
        const callRecordings = response.data;

        // Fetch funding information for each call recording
        const fundingPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://externalapi.com/funding/${recording.id}`);
            return { recording, funding: fundingResponse.data };
        });

        const results = await Promise.all(fundingPromises);

        // Structure the response
        res.json(results);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

module.exports = router;