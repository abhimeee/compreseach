const express = require('express');
const callRecordingsRouter = require('./api/callRecordings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Use the call recordings API
app.use('/', callRecordingsRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});