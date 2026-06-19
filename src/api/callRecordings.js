const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const router = express.Router();

// Middleware for token-based authentication
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (token == null) return res.sendStatus(401); // No token found

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.user = user;
        next();
    });
}

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const recordingsResponse = await axios.get('https://externalapi.com/call-recordings');
        const fundingResponse = await axios.get('https://externalapi.com/funding-info');

        const callRecordings = recordingsResponse.data;
        const fundingInfo = fundingResponse.data;

        // Structure response as separate entities
        const response = {
            callRecordings,
            fundingInfo
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;