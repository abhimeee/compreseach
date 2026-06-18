const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication  
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Fetch call recordings and funding information  
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://externalapi.com/callRecordings');
        const callRecordings = response.data;

        // Assuming that funding info can be fetched from another endpoint  
        const fundingResponses = await Promise.all(callRecordings.map(recording => 
            axios.get(`https://externalapi.com/fundingInfo/${recording.id}`)
        ));

        const fundingInfo = fundingResponses.map(resp => resp.data);

        // Structure the response  
        const structuredResponse = callRecordings.map((recording, index) => ({
            recording,
            funding: fundingInfo[index],
        }));

        res.json(structuredResponse);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

module.exports = router;