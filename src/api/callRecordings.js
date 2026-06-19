const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const router = express.Router();
const API_URL = 'https://external-api.example.com/call-recordings';

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
        if (err) return res.sendStatus(403);
        next();
    });
};

// GET endpoint for fetching call recordings
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        // Fetch call recordings
        const response = await axios.get(API_URL);
        const callRecordings = response.data;

        // Fetch funding information for each call recording
        const fundingInfoPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.example.com/funding/${recording.id}`);
            return { recording, funding: fundingResponse.data };
        });

        const callRecordingsWithFunding = await Promise.all(fundingInfoPromises);

        // Structure response
        res.json(callRecordingsWithFunding);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }
});

module.exports = router;