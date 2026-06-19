const axios = require('axios');
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware for token-based authentication
app.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Access Denied');
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid Token');
        req.user = user;
        next();
    });
});

// Endpoint to fetch call recordings and funding info
app.get('/api/call-recordings', async (req, res) => {
    try {
        // Fetch call recordings from the external API
        const recordingsResponse = await axios.get('https://external-api.com/call-recordings');
        const recordings = recordingsResponse.data;

        // Fetch funding info for each recording
        const fundingPromises = recordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://external-api.com/funding/${recording.id}`);
            return fundingResponse.data;
        });

        const fundingInfos = await Promise.all(fundingPromises);

        // Structure the response
        const responseData = recordings.map((recording, index) => ({
            recording,
            fundingInfo: fundingInfos[index],
        }));

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
