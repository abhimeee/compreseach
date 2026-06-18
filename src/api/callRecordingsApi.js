const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Access Denied');
    jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
        if (err) return res.status(403).send('Invalid Token');
        next();
    });
});

// Fetch all call recordings and their funding information
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external.api/call-recordings');
        const callRecordings = response.data;
        
        // Fetch funding information for each call recording
        const fundingResponses = await Promise.all(callRecordings.map(recording => 
            axios.get(`https://external.api/funding-info/${recording.id}`)));
        
        // Map funding info to corresponding recordings
        const responseData = callRecordings.map((recording, index) => ({
            recording,
            fundingInfo: fundingResponses[index].data
        }));
        
        res.json(responseData);
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

module.exports = router;