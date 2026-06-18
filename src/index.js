const express = require('express');
const callRecordingsRouter = require('./api/callRecordings');

const app = express();
app.use(express.json());

// Use the API router
app.use('/api', callRecordingsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});