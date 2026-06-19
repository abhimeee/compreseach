'use strict';

const express = require('express');
const callRecordingRoutes = require('./api/call_recordings');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Use call recording routes
app.use('/api', callRecordingRoutes);

app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
});