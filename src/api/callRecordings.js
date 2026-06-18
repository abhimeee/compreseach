const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for token-based authentication
app.use((req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(403);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
});

// Fetch call recordings
app.get('/api/call-recordings', async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call_recordings');
        const recordings = response.data;

        // Example processing logic for fetching funding information
        const fundingPromises = recordings.map(recording =>
            axios.get(`https://external-api.com/funding/${recording.id}`)
        );

        const fundingData = await Promise.all(fundingPromises);

        const formattedResponse = recordings.map((recording, index) => ({
            recording,
            funding: fundingData[index].data,
        }));

        res.json(formattedResponse);
    } catch (error) {
        console.error('Error fetching call recordings:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});