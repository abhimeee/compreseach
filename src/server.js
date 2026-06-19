const express = require('express');
const callRecordingsRouter = require('./api/callRecordings');
const app = express();

app.use(express.json());

// Use the call recordings API router
app.use('/api', callRecordingsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});