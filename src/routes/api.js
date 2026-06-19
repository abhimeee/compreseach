const express = require('express');
const callRecordings = require('../api/callRecordings');

const router = express.Router();

router.use('/callRecordings', callRecordings);

module.exports = router;