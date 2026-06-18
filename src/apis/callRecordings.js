const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send('Forbidden - No token provided');
    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) return res.status(403).send('Forbidden - Invalid token');
        req.user = decoded; // store user info
        next();
    });
});

// Endpoint to fetch call recordings
router.get('/call-recordings', async (req, res) => {
    try {
        // Fetch call recordings from external API
        const response = await axios.get('https://externalapi.com/call-recordings', {
            headers: {
                'Authorization': `Bearer ${req.headers['authorization'].split(' ')[1]}`
            }
        });

        const callRecordingsData = response.data;
        const callRecordings = [];
        const fundingInfo = [];

        // Parse response for call recordings and funding information
        callRecordingsData.forEach(recording => {
            callRecordings.push({ id: recording.id, title: recording.title });
            fundingInfo.push({ recordingId: recording.id, funding: recording.funding });
        });

        // Send response with separate entities for call recordings and funding info
        res.json({ callRecordings, fundingInfo });
    } catch (error) {
        console.error('Error fetching call recordings:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;