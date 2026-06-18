const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to check token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
        if (err) return res.sendStatus(403);
        next();
    });
}

// Fetch call recordings
router.get('/callRecordings', authenticateToken, async (req, res) => {
    try {
        const recordingsResponse = await axios.get('https://externalapi.com/call-recordings'); // Replace with the actual endpoint
        const fundingResponse = await axios.get('https://externalapi.com/funding-info'); // Replace with the actual endpoint

        const recordings = recordingsResponse.data;
        const fundingInfo = fundingResponse.data;

        // Assuming both recordings and fundingInfo have an id property to match them
        const response = recordings.map(recording => {
            return {
                ...recording,
                funding: fundingInfo.find(fund => fund.recordingId === recording.id)
            };
        });

        res.json({ recordings: response });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;