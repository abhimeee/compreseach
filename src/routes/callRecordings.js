const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock function for token verification  
function verifyToken(req, res, next) {  
    const token = req.headers['authorization'];  
    if (!token) return res.sendStatus(403);
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) return res.sendStatus(403);
        next();
    });
}

// Fetch all call recordings along with funding info  
router.get('/call-recordings', verifyToken, async (req, res) => {
    try {
        const callRecordingsResponse = await axios.get('https://externalapi.com/call-recordings');
        const fundingInfoResponse = await axios.get('https://externalapi.com/funding-info');

        const callRecordings = callRecordingsResponse.data;
        const fundingInfo = fundingInfoResponse.data;

        // Assuming fundingInfo is structured to link back to call recordings
        const response = callRecordings.map(record => ({
            recording: record,
            funding: fundingInfo.find(fund => fund.recordingId === record.id) // assuming 'id'
        }));

        res.json(response);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;