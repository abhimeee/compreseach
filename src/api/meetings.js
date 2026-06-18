const express = require('express');
const router = express.Router();
const { getMeetingTranscripts, getFundingInfo } = require('../services/meetingService');

/**
 * @route GET /api/meeting-transcripts
 * @desc Retrieve meeting transcripts and funding information
 * @returns {Object} transcripts and funding information
 */
router.get('/meeting-transcripts', async (req, res) => {
    try {
        // Get meeting transcripts
        const transcripts = await getMeetingTranscripts();

        // Extract unique company names from the transcripts
        const companies = new Set(transcripts.map(t => t.company));

        // Get funding info for each company
        const fundingPromises = Array.from(companies).map(company => getFundingInfo(company));
        const fundingInfo = await Promise.all(fundingPromises);

        // Construct response payload
        const response = transcripts.map(transcript => {
            const fundingDetails = fundingInfo.find(info => info.company === transcript.company) || {};
            return {
                ...transcript,
                fundingRound: fundingDetails.latestRound,
                totalFunding: fundingDetails.totalAmount
            };
        });

        res.json(response);
    } catch (error) {
        console.error('Error retrieving meeting transcripts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;