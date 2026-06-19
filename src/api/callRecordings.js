const express = require('express');
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Endpoint to fetch all call recordings
router.get('/call-recordings', verifyToken, async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call-recordings');
        const recordings = response.data;

        const fundingPromises = recordings.map(recording => 
            axios.get(`https://external-api.com/funding-info/${recording.id}`)
        );

        const fundingInfos = await Promise.all(fundingPromises);

        const result = recordings.map((recording, index) => ({
            recording,
            fundingInfo: fundingInfos[index].data
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;