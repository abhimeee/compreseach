const express = require('express');
const app = express();
const callRecordingsRouter = require('./api/callRecordings');

app.use(express.json());

// Use call recordings API routes
app.use('/api', callRecordingsRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});