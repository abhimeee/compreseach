const express = require('express');
const app = express();
require('dotenv').config();
const callRecordingsRouter = require('./api/callRecordings');

// Middleware for parsing JSON
app.use(express.json());

// Use the call recordings API
app.use('/api', callRecordingsRouter);

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});