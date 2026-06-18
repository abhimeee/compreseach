const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Token is required');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user;
        next();
    });
});

// Endpoint to fetch call recordings and funding information
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://externalapi.com/call-recordings');
        const callRecordings = response.data;

        const fundingPromises = callRecordings.map(recording => 
            axios.get(`https://externalapi.com/funding/${recording.id}`));

        const fundingResponses = await Promise.all(fundingPromises);
        const fundingInfos = fundingResponses.map(r => r.data);

        const responseData = callRecordings.map((recording, index) => ({
            recording,
            fundingInfo: fundingInfos[index],
        }));

        return res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).send('Failed to fetch data');
    }
});

module.exports = router;