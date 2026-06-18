const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send('A token is required.');
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) return res.status(401).send('Invalid Token.');
        next();
    });
});

// Fetch call recordings and funding info
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external.api/callRecordings');
        const recordings = response.data;

        // Fetch funding info for each recording
        const fundingInfoPromises = recordings.map(recording => 
            axios.get(`https://external.api/funding/${recording.id}`)
                .then(response => ({...recording, fundingInfo: response.data}))
        );

        const recordingsWithFunding = await Promise.all(fundingInfoPromises);

        res.json({ callRecordings: recordingsWithFunding });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;