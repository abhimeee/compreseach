const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // assuming we are using JWT for token authentication

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('A token is required for authentication');
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
    return next();
});

// Endpoint to fetch call recordings and funding information
router.get('/call-recordings', async (req, res) => {
    try {
        // Fetch call recordings from the external API
        const response = await axios.get('https://externalapi.com/call-recordings', {
            headers: { 'Authorization': `Bearer ${process.env.EXTERNAL_API_TOKEN}` }
        });

        const callRecordings = response.data;

        // Fetch funding information for each call recording
        const fundingPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://externalapi.com/funding-info/${recording.id}`, {
                headers: { 'Authorization': `Bearer ${process.env.EXTERNAL_API_TOKEN}` }
            });
            return {
                recording,
                funding: fundingResponse.data
            };
        });

        const results = await Promise.all(fundingPromises);
        return res.json(results);
    } catch (error) {
        console.error('Error fetching call recordings or funding info:', error);
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = router;