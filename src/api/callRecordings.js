'use strict';

const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
        if (err) return res.sendStatus(403);
        next();
    });
}

// Fetch Call Recordings
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call_recordings');
        const callRecordings = response.data;

        // Assuming the funding info is part of the call recording response
        const fundingPromises = callRecordings.map(recording => {
            return axios.get(`https://external-api.com/funding_info/${recording.id}`);
        });

        const fundingInfos = await Promise.all(fundingPromises);

        // Structure response
        const responseData = callRecordings.map((recording, index) => {
            return {
                recording,
                fundingInfo: fundingInfos[index].data,
            };
        });

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.sendStatus(500);
    }
});

module.exports = router;