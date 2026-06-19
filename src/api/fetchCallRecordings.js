const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');

// Middleware for token-based authentication
const fetchCallRecordings = async (req, res) => {
    try {
        // Token-based authentication
        authenticateToken(req, res);

        // Fetch call recordings from external API
        const response = await axios.get('https://external-api.com/call-recordings');
        const callRecordings = response.data;

        // Fetch funding info related to each recording
        const fundingPromises = callRecordings.map(recording => 
            axios.get(`https://external-api.com/funding/${recording.id}`) // Assuming ID is used for fetching funding
        );

        const fundingInfo = await Promise.all(fundingPromises);

        // Structure response
        const responseData = callRecordings.map((recording, index) => {
            return {
                recording,
                funding: fundingInfo[index].data
            };
        });

        return res.status(200).json(responseData);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = { fetchCallRecordings };