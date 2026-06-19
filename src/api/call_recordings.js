'use strict';

const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(403).send({ message: 'No token provided.' });
    }
    jwt.verify(token, 'your_secret_key_here', (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to authenticate token.' });
        }
        req.userId = decoded.id;
        next();
    });
});

// Endpoint to fetch call recordings and funding info
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://externalapi.com/call_recordings'); // Replace with actual API
        const callRecordings = response.data.callRecordings;

        const fundingInfoResponses = await Promise.all(callRecordings.map(recording => {
            return axios.get(`https://externalapi.com/funding_info/${recording.id}`); // Replace with actual funding API
        }));

        const fundingInfo = fundingInfoResponses.map(response => response.data);

        res.status(200).send({
            callRecordings: callRecordings,
            fundingInfo: fundingInfo
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to fetch data' });
    }
});

module.exports = router;