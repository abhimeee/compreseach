const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Secret key for JWT
const SECRET_KEY = 'your_secret_key';

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send('Token is required.');
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).send('Invalid token.');
        req.user = decoded;
        next();
    });
});

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', async (req, res) => {
    try {
        const callRecordingsResponse = await axios.get('https://external-api.com/callRecordings');
        const fundingInfoResponse = await axios.get('https://external-api.com/fundingInfo');

        // Assuming both responses are arrays
        const callRecordings = callRecordingsResponse.data;
        const fundingInfo = fundingInfoResponse.data;

        // Structure the response
        const response = {
            callRecordings,
            fundingInfo
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data.');
    }
});

module.exports = router;