const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Forbidden: No token provided.' });
    }
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden: Invalid token.' });
        }
        req.user = decoded; // Save user info from token
        next();
    });
});

// Fetch call recordings and funding info
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call-recordings');
        const callRecordings = response.data;

        // Fetch funding info separately
        const fundingPromises = callRecordings.map(recording => axios.get(`https://external-api.com/funding/${recording.id}`));
        const fundingResponses = await Promise.all(fundingPromises);

        // Prepare final response
        const finalResponse = callRecordings.map((recording, index) => ({
            callRecording: recording,
            fundingInfo: fundingResponses[index].data
        }));

        return res.status(200).json(finalResponse);
    } catch (error) {
        console.error('Error fetching call recordings:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;