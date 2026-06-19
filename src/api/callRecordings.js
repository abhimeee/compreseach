const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware for token verification
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('A token is required for authentication');
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send('Invalid Token');
        req.user = decoded;
        next();
    });
};

// Endpoint to fetch all call recordings and associated funding info
router.get('/call-recordings', verifyToken, async (req, res) => {
    try {
        // Fetch call recordings
        const recordingsResponse = await axios.get('https://external-api.com/call-recordings');
        const callRecordings = recordingsResponse.data;

        // Fetch funding info associated with each recording
        const fundingPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.com/funding/${recording.id}`);
            return { ...recording, funding: fundingResponse.data };
        });

        const recordingsWithFunding = await Promise.all(fundingPromises);
        return res.json(recordingsWithFunding);
    } catch (error) {
        return res.status(500).send('An error occurred while fetching data');
    }
});

module.exports = router;