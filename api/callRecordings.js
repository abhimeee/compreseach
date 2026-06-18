const express = require('express');
const axios = require('axios');

const app = express();
const EXTERNAL_API_URL = 'https://external-api.com/call-recordings';

// Middleware to check token-based authentication
app.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token || !isValidToken(token)) { // Assuming isValidToken checks the token validity
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
});

// Endpoint to fetch call recordings and associated funding information
app.get('/api/call_recordings', async (req, res) => {
    try {
        const response = await axios.get(EXTERNAL_API_URL);
        const data = response.data;
        res.json({
            call_recordings: data.recordings,
            funding_info: data.funding
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch recordings from external source' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
