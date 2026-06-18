const express = require('express');
const axios = require('axios');
const router = express.Router();

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    // Verify token logic here (using JWT or any preferred method)
    next();
};

router.use(authenticateToken);

// Endpoint for fetching call recordings
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external.api/call-recordings');
        const callRecordings = response.data;
        const fundingInfoPromises = callRecordings.map(recording => 
            axios.get(`https://external.api/funding-info/${recording.id}`)
        );
        const fundingInfoResponses = await Promise.all(fundingInfoPromises);
        const fundingInfos = fundingInfoResponses.map(info => info.data);

        // Structure the API response
        const result = callRecordings.map((recording, index) => ({
            recording,
            fundingInfo: fundingInfos[index]
        }));

        return res.json(result);
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Error fetching data' });
    }
});

module.exports = router;