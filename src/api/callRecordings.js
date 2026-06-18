const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('Token is required.');
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Invalid token.');
        }
        req.user = decoded;
        next();
    });
});

// Endpoint to fetch call recordings
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://api.external.com/callRecordings', {
            headers: { 'Authorization': `Bearer ${process.env.EXTERNAL_API_TOKEN}` }
        });

        const callRecordings = response.data;
        let formattedResponse = [];

        for (const recording of callRecordings) {
            let fundingInfo = await axios.get(`https://api.external.com/funding/${recording.id}`, {
                headers: { 'Authorization': `Bearer ${process.env.EXTERNAL_API_TOKEN}` }
            });
            formattedResponse.push({
                recording,
                funding: fundingInfo.data
            });
        }

        return res.status(200).json(formattedResponse);
    } catch (error) {
        return res.status(500).send('Error fetching data.');
    }
});

module.exports = router;