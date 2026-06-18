const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('A token is required for authentication');
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Invalid Token');
        }
        req.user = decoded;
        next();
    });
});

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', async (req, res) => {
    try {
        // Fetch call recordings from external API
        const recordingsResponse = await axios.get('https://external.api/callRecordings');
        const fundingResponse = await axios.get('https://external.api/fundingInfo');

        const callRecordings = recordingsResponse.data;
        const fundingInfo = fundingResponse.data;

        // Structuring response
        const response = callRecordings.map(recording => {
            return {
                recording,
                funding: fundingInfo.find(f => f.callId === recording.id)
            };
        });

        return res.json(response);
    } catch (error) {
        return res.status(500).send('Error fetching data');
    }
});

module.exports = router;