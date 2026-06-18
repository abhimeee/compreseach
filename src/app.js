const express = require('express');
const app = express();
const fetchCallRecordings = require('./api/fetchCallRecordings');
require('dotenv').config();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api', fetchCallRecordings);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});