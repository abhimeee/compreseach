const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware for token verification
router.use((req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).send('Access Denied');
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid Token');
        req.user = user;
        next();
    });
});

// Endpoint to fetch call recordings
router.get('/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://externalapi.com/call-recordings');
        const callRecordings = response.data.map(record => ({
            id: record.id,
            title: record.title,
            date: record.date
        }));

        const fundingInfoResponses = await Promise.all(callRecordings.map(record => 
            axios.get(`https://externalapi.com/funding-info/${record.id}`)
        ));

        const fundingInfo = fundingInfoResponses.map(response => response.data);

        res.json({ callRecordings, fundingInfo });
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

module.exports = router;