const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(403).send('Token is required.');
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) return res.status(401).send('Invalid token.');
        next();
    });
});

// Fetch call recordings endpoint
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/callRecordings');
        const callRecordings = response.data;

        // Fetch funding info for each call recording
        const fundingPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.com/fundingInfo/${recording.id}`);
            return {
                recording,
                funding: fundingResponse.data,
            };
        });

        const result = await Promise.all(fundingPromises);
        res.json(result);
    } catch (error) {
        res.status(500).send('Error fetching call recordings or funding info.');
    }
});

module.exports = router;