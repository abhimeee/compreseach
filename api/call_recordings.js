const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for token-based authentication
app.use((req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).send('Access Denied');
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) return res.status(403).send('Invalid Token');
        next();
    });
});

// Endpoint for fetching call recordings
app.get('/api/callRecordings', async (req, res) => {
    try {
        const response = await axios.get('https://externalapi.com/callrecordings');
        const callRecordings = response.data;

        const fundingPromises = callRecordings.map(async (record) => {
            const fundingResponse = await axios.get(`https://externalapi.com/funding/${record.fundingId}`);
            return {...record, fundingInfo: fundingResponse.data};
        });

        const recordingsWithFunding = await Promise.all(fundingPromises);
        res.json(recordingsWithFunding);
    } catch (error) {
        console.error('Error fetching call recordings:', error);
        res.status(500).send('Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
