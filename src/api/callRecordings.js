const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Endpoint to fetch all call recordings and corresponding funding info
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        // Fetch call recordings from external API
        const callRecordingsResponse = await axios.get('https://externalapi.com/callrecordings');
        const callRecordings = callRecordingsResponse.data;

        const fundingInfoPromises = callRecordings.map(async (recording) => {
            // Fetch funding info for each call recording
            const fundingResponse = await axios.get(`https://externalapi.com/funding/${recording.id}`);
            return fundingResponse.data;
        });

        const fundingInfos = await Promise.all(fundingInfoPromises);

        // Structure the response
        const response = callRecordings.map((recording, index) => ({
            recording,
            funding: fundingInfos[index],
        }));

        res.json(response);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;