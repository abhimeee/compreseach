const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Mock function for token verification
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('A token is required for authentication');
    try {
        const decoded = jwt.verify(token, 'YOUR_SECRET_KEY'); // Use environment variable for secure key
        req.user = decoded;
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
    return next();
};

// Endpoint to fetch call recordings
router.get('/call-recordings', verifyToken, async (req, res) => {
    try {
        const response = await axios.get('https://external.api/call-recordings'); // Change to actual external API URL
        const callRecordings = response.data;

        // Fetch funding info for each call recording
        const fundingInfoPromises = callRecordings.map(recording => 
            axios.get(`https://external.api/funding/${recording.fundingId}`) // Adjust as necessary
        );

        const fundingInfoResponses = await Promise.all(fundingInfoPromises);
        const fundingInfo = fundingInfoResponses.map(funding => funding.data);

        // Structure the response
        const structuredResponse = callRecordings.map((recording, index) => ({
            recording,
            funding: fundingInfo[index],
        }));

        res.status(200).json(structuredResponse);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching call recordings or funding information');
    }
});

module.exports = router;