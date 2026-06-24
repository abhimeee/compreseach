const express = require('express');
const router = express.Router();
const db = require('../db'); // Assume we have a database module to handle queries

/**
 * @route GET /api/meetings/transcripts
 * @desc Retrieve meeting transcripts and funding information
 * @access Public
 */
router.get('/transcripts', async (req, res) => {
    try {
        // Get meeting transcripts
        const meetingTranscripts = await db.query('SELECT * FROM meeting_transcripts');

        // Extract company mentions from transcripts
        const companies = new Set();
        meetingTranscripts.forEach(transcript => {
            const mentions = transcript.text.match(/\b[A-Z][a-zA-Z]*\b/g);
            if (mentions) {
                mentions.forEach(company => companies.add(company));
            }
        });

        // Fetch funding information for mentioned companies
        const fundingInfo = await Promise.all([...companies].map(async company => {
            const fundingData = await db.query('SELECT * FROM funding WHERE company = ?', [company]);
            const latestFunding = fundingData.sort((a, b) => new Date(b.date) - new Date(a.date))[0]; // Get latest round
            return {
                company,
                totalFunding: fundingData.reduce((sum, round) => sum + round.amount, 0),
                latestRound: latestFunding ? latestFunding.round : null,
                latestAmount: latestFunding ? latestFunding.amount : null
            };
        }));

        return res.status(200).json({ meetingTranscripts, fundingInfo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;