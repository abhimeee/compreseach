const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for token-based authentication
app.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Token is required');
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret'); // Replace with your secret
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).send('Invalid token');
    }
});

// Endpoint to fetch call recordings
app.get('/api/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://externalapi.com/callrecordings'); // Replace with actual API URL
        const recordings = response.data.recordings;
        const fundingInfo = await Promise.all(recordings.map(async (recording) => {
            const fundingResponse = await axios.get(`https://externalapi.com/funding/${recording.id}`); // Fetch funding details
            return fundingResponse.data;
        }));

        const result = recordings.map((recording, index) => ({
            recording,
            funding: fundingInfo[index],
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching call records:', error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(PORT, () => {
    console.log(`API is running on http://localhost:${PORT}`);
});
