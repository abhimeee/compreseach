const express = require('express');
const dotenv = require('dotenv');
const callRecordings = require('./api/callRecordings');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Use the API routes
app.use('/api', callRecordings);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});