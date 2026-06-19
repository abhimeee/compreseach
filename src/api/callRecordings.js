const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const callRecordingsResponse = await axios.get('https://external-api.example.com/call-recordings');
        const fundingInfoResponse = await axios.get('https://external-api.example.com/funding-info');

        // Process and structure the response
        const callRecordings = callRecordingsResponse.data;
        const fundingInfo = fundingInfoResponse.data;

        const response = callRecordings.map(recording => ({
            ...recording,
            funding: fundingInfo.find(fund => fund.recordingId === recording.id)
        }));

        res.json(response);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;