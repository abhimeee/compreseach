const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
        if (err) return res.sendStatus(403);
        next();
    });
};

// API endpoint to fetch call recordings
router.get('/callRecordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://externalapi.com/callRecordings');
        const callRecordings = response.data;

        // Process and fetch funding info
        const fundingPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://externalapi.com/funding/${recording.id}`);
            return {
                recording,
                funding: fundingResponse.data 
            };
        });

        const result = await Promise.all(fundingPromises);
        res.json(result);
    } catch (error) {
        console.error('Error fetching call recordings:', error);
        res.status(500).send('Error fetching call recordings');
    }
});

module.exports = router;