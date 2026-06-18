const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();
const AUTH_TOKEN = 'your_auth_token'; // Replace with actual token or config

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, 'your_jwt_secret', (err, user) => { // replace with your secret
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Endpoint to fetch call recordings and funding information
router.get('/callRecordings', authenticateToken, async (req, res) => {
    try {
        const recordingsResponse = await axios.get('https://externalapi.com/callRecordings', {
            headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        });

        const recordings = recordingsResponse.data;

        // Fetch funding information related to each call recording
        const fundingPromises = recordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://externalapi.com/funding/${recording.id}`, {
                headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
            });
            return {
                recording,
                funding: fundingResponse.data
            };
        });

        const results = await Promise.all(fundingPromises);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;