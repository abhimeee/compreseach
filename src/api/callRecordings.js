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

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://externalapi.com/call-recordings'); // Replace with actual API endpoint
        const callRecordings = response.data;

        // Fetch funding information for each call recording
        const fundingPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://externalapi.com/funding/${recording.id}`); // Replace with actual funding API endpoint
            return { recording, fundingInfo: fundingResponse.data };
        });

        const results = await Promise.all(fundingPromises);
        res.status(200).json(results);

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;