const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // Assuming JWT for token-based authentication

const router = express.Router();

// Middleware for token verification
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Fetch call recordings and funding info
router.get('/call-recordings', authenticateToken, async (req, res) => {
  try {
    // Replace with actual external API URL
    const recordingsResponse = await axios.get('https://externalapi.com/call-recordings');
    const fundingResponse = await axios.get('https://externalapi.com/funding-info');

    const callRecordings = recordingsResponse.data;
    const fundingInfo = fundingResponse.data;

    // Process data to return separate entities
    const responseData = {
      callRecordings,
      fundingInfo,
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching data: ', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;