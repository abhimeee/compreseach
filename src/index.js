const express = require('express');
const callRecordingsRouter = require('./api/callRecordings');

const app = express();

// Middleware and routes
app.use(express.json());
app.use('/api', callRecordingsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});