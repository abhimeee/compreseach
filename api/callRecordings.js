const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// Middleware for token-based authentication
app.use((req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'No token provided.' });
    }
    jwt.verify(token, 'YOUR_SECRET_KEY', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized.' });
        }
        req.userId = decoded.id;
        next();
    });
});

// Endpoint to fetch call recordings
app.get('/api/callRecordings', async (req, res) => {
    try {
        const response = await axios.get('https://externalapi.com/callRecordings');
        const callRecordings = response.data;

        // Fetch funding info separately
        const fundingInfoPromises = callRecordings.map(recording =>
            axios.get(`https://externalapi.com/fundingInfo/${recording.id}`)
        );

        const fundingInfos = await Promise.all(fundingInfoPromises);

        const structuredResponse = callRecordings.map((recording, index) => ({
            recording,
            funding: fundingInfos[index].data
        }));

        res.json(structuredResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});