const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Fetch call recordings endpoint
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call-recordings', {
            headers: { 'Authorization': `Bearer ${process.env.EXTERNAL_API_TOKEN}` }
        });

        const callRecordings = response.data;

        // Fetch funding information associated with each call recording
        const fundingInfoPromises = callRecordings.map(recording => 
            axios.get(`https://external-api.com/funding-info/${recording.id}`));

        const fundingResponses = await Promise.all(fundingInfoPromises);
        const fundingInfos = fundingResponses.map(res => res.data);

        res.json({ callRecordings, fundingInfos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

module.exports = router;