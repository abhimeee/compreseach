const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = 'https://externalapi.com/call_recordings'; // Replace with the actual API URL

// Middleware for token-based authentication
app.use((req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(403).send('A token is required for authentication');
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret'); // Replace with your JWT secret
        req.user = decoded;
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
    return next();
});

// Endpoint to fetch call recordings
app.get('/api/call-recordings', async (req, res) => {
    try {
        const response = await axios.get(API_URL);
        const callRecordings = response.data;
        const fundingInfo = callRecordings.map(recording => ({
            id: recording.id,
            fundingDetails: recording.funding_info // Assuming funding_info is part of the recording
        }));
        res.json({
            callRecordings: callRecordings,
            fundingInfo: fundingInfo
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});