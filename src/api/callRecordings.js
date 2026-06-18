const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(express.json());

// Token-based authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Fetch call recordings
app.get('/api/callRecordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/callRecordings');
        const callRecordings = response.data;

        // Fetch associated funding information
        const fundingPromises = callRecordings.map(recording => {
            return axios.get(`https://external-api.com/funding/${recording.id}`);
        });

        const fundingInfos = await Promise.all(fundingPromises);

        // Structure response
        const structuredResponse = callRecordings.map((recording, index) => ({
            callRecording: recording,
            fundingInfo: fundingInfos[index].data,
        }));

        res.json(structuredResponse);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from external API' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
