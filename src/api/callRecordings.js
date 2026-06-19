'use strict';

const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // Assuming we use JWT for token-based auth

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).send('Failed to authenticate token.');
            req.user = decoded;
            next();
        });
    } else {
        return res.status(403).send('No token provided.');
    }
});

// Endpoint to fetch all call recordings
router.get('/call-recordings', async (req, res) => {
    try {
        // Replace with the actual URL of the external API
        const response = await axios.get('https://external-api.com/call-recordings');
        const callRecordings = response.data;

        // Simulated logic to fetch corresponding funding info
        // Fetch funding info by iterating through call recordings
        const fundingInfo = await Promise.all(callRecordings.map(async (recording) => {
            // Replace with the actual logic/API to fetch funding information
            const fundingResponse = await axios.get(`https://external-api.com/funding/${recording.fundingId}`);
            return fundingResponse.data;
        }));

        // Structure response
        const responseData = callRecordings.map((recording, index) => ({
            recording,
            funding: fundingInfo[index],
        }));

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error fetching call recordings:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;