const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Fetching call recordings and funding info
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call-recordings');
        const callRecordings = response.data;

        const fundingPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.com/funding/${recording.id}`);
            return { recording, funding: fundingResponse.data };
        });

        const results = await Promise.all(fundingPromises);

        res.json(results);
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

module.exports = router;