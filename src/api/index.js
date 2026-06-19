'use strict';

const express = require('express');
const callRecordingsRoutes = require('./callRecordings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// API Routes
app.use('/api', callRecordingsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});