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

// Fetch Call Recordings
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://externalapi.com/callRecordings');
        const callRecordings = response.data;

        // Simulating fetching funding info for each call recording
        const fundingPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://externalapi.com/funding/${recording.id}`);
            return {
                recording,
                funding: fundingResponse.data,
            };
        });

        const results = await Promise.all(fundingPromises);
        return res.json(results);
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = router;