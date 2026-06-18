const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
        if (err) return res.sendStatus(403);
        next();
    });
};

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const recordingsResponse = await axios.get('https://external-api.com/callRecordings');
        const fundingResponses = await Promise.all(recordingsResponse.data.map(recording => 
            axios.get(`https://external-api.com/funding/${recording.id}`)
        ));

        const response = recordingsResponse.data.map((recording, index) => ({
            recording,
            fundingInfo: fundingResponses[index].data
        }));

        res.json(response);
    } catch (error) {
        console.error('Error fetching data', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;