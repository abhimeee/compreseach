const express = require('express');
const callRecordings = require('./api/callRecordings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Use the call recordings API routes
app.use('/api', callRecordings);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});