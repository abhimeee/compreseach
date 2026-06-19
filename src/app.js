const express = require('express');
const callRecordingsRouter = require('./api/callRecordings');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Use the call recordings API
app.use('/api', callRecordingsRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});