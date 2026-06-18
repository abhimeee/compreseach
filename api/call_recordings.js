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

// Fetch call recordings
app.get('/api/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call_recordings');
        const callRecordings = response.data;

        // Fetch funding info for each call recording
        const fundingInfoPromises = callRecordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.com/funding/${recording.id}`);
            return { recording, funding: fundingResponse.data };
        });

        const result = await Promise.all(fundingInfoPromises);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});