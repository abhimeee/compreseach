const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('Forbidden');
    }
    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) {
            return res.status(403).send('Forbidden');
        }
        req.user = user;
        next();
    });
});

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://externalapi.example.com/call-recordings');
        const recordings = response.data.recordings;

        // Assuming funding information is available under `funding`
        const fundingResponses = await Promise.all(recordings.map(recording =>
            axios.get(`https://externalapi.example.com/funding/${recording.id}`)
        ));

        const fundingInfo = fundingResponses.map((fundingResponse, index) => ({
            recordingId: recordings[index].id,
            funding: fundingResponse.data.funding
        }));

        res.json({
            callRecordings: recordings,
            fundingInfo: fundingInfo
        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;