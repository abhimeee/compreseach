const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate token.' });
        }
        req.user = decoded;
        next();
    });
});

// Fetch call recordings and funding info
router.get('/callRecordings', async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call_recordings');
        const recordings = response.data;

        // Fetch funding information for each recording
        const fundingPromises = recordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.com/funding/${recording.id}`);
            return {
                ...recording,
                funding: fundingResponse.data
            };
        });

        const recordingsWithFunding = await Promise.all(fundingPromises);

        res.json(recordingsWithFunding);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the data.' });
    }
});

module.exports = router;