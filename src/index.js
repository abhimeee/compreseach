const express = require('express');
const callRecordingsRouter = require('./api/callRecordings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Use the call recordings API router
app.use('/api', callRecordingsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});