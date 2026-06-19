const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Authorization token required');

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = decoded;
        next();
    });
});

// Fetch call recordings and associated funding info
router.get('/', async (req, res) => {
    try {
        // Fetch call recordings
        const recordingsResponse = await axios.get('https://externalapi.com/call-recordings');
        const callRecordings = recordingsResponse.data;

        // Fetch funding info for each call recording
        const fundingPromises = callRecordings.map(recording => 
            axios.get(`https://externalapi.com/funding/${recording.id}`)
                .then(fundingResponse => {
                    return {...recording, funding: fundingResponse.data};
                })
        );

        const callRecordingsWithFunding = await Promise.all(fundingPromises);

        // Structure response
        const response = {
            callRecordings: callRecordingsWithFunding,
        };

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data');
    }
});

module.exports = router;