const express = require('express');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token-based authentication
router.use((req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  if (!token) {
    return res.status(401).send('Access Denied');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) {
      return res.status(403).send('Invalid Token');
    }
    next();
  });
});

// Endpoint for fetching call recordings and funding info
router.get('/call-recordings', async (req, res) => {
  try {
    const response = await fetch('https://external-api.com/call-recordings');
    const data = await response.json();

    const recordings = data.recordings.map(recording => ({
      id: recording.id,
      title: recording.title,
      timestamp: recording.timestamp
    }));

    const fundingDetails = await Promise.all(data.recordings.map(async (recording) => {
      const fundingResponse = await fetch(`https://external-api.com/funding/${recording.id}`);
      return fundingResponse.json();
    }));

    res.status(200).json({
      recordings,
      fundingDetails
    });
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

module.exports = router;