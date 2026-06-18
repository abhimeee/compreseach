const axios = require('axios');

/**
 * Retrieve meeting transcripts from external API
 */
async function getMeetingTranscripts() {
    // Example: Replace with actual implementation to fetch transcripts
    return await axios.get('https://api.example.com/meeting-transcripts');
}

/**
 * Retrieve funding information for a specific company
 * @param {string} company - Company name
 */
async function getFundingInfo(company) {
    // Example: Replace with actual implementation to fetch funding info
    const response = await axios.get(`https://api.example.com/funding-info?company=${encodeURIComponent(company)}`);
    return response.data;
}

module.exports = {
    getMeetingTranscripts,
    getFundingInfo
};