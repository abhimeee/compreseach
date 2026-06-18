import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware for token-based authentication
const authenticateToken = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.sendStatus(403);
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Fetch call recordings and their funding information
router.get('/call-recordings', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get('https://external-api.com/call-recordings');
        const callRecordings = response.data;

        // Assuming each call recording has an associated funding id
        let fundingInfoPromises = callRecordings.map(recording => {
            return axios.get(`https://external-api.com/funding/${recording.fundingId}`);
        });

        const fundingInfos = await Promise.all(fundingInfoPromises);

        const structuredResponse = callRecordings.map((recording, index) => {
            return {
                callRecording: recording,
                fundingInfo: fundingInfos[index].data
            };
        });

        res.json(structuredResponse);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.sendStatus(500);
    }
});

export default router;