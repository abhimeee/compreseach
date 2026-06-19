const express = require('express');
const callRecordingsRouter = require('./api/callRecordings');

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Use the call recordings API
app.use('/api', callRecordingsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});