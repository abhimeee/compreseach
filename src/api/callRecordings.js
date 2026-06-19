const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    });
});

// Fetch call recordings
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call-recordings');
        const callRecords = response.data;

        // Fetch funding information for each call recording
        const fundingResponses = await Promise.all(callRecords.map(record => 
            axios.get(`https://external-api.com/funding/${record.id}`)
        ));

        // Structure response
        const structuredResponse = callRecords.map((record, index) => {
            return {
                callRecording: record,
                fundingInfo: fundingResponses[index].data
            };
        });

        return res.json(structuredResponse);
    } catch (error) {
        console.error('Error fetching call recordings:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;