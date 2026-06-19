const express = require('express');
const fetch = require('node-fetch');
const { authenticate } = require('./authMiddleware');

const router = express.Router();

// Mock external API endpoint for fetching call recordings
const EXTERNAL_CALL_RECORDINGS_API = 'https://external-api.com/call-recordings';

router.get('/call-recordings', authenticate, async (req, res) => {
    try {
        const response = await fetch(EXTERNAL_CALL_RECORDINGS_API);
        const callRecordings = await response.json();

        // Assuming each recording has an associated funding info
        const fundingInfo = await fetchFundingInfo(callRecordings);

        return res.json({
            callRecordings,
            fundingInfo
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch call recordings.' });
    }
});

async function fetchFundingInfo(callRecordings) {
    // Mock implementation to fetch funding info related to call recordings
    // Ideally, an external API call to fetch funding info should be placed here
    return callRecordings.map(recording => ({
        id: recording.id,
        funding: Math.floor(Math.random() * 1000) // Dummy funding amount
    }));
}

module.exports = router;