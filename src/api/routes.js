const express = require('express');
const fetchCallRecordings = require('./fetchCallRecordings');

const router = express.Router();

// Call recording routes
router.use('/call-recordings', fetchCallRecordings);

module.exports = router;