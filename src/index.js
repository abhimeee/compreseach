const express = require('express');
const callRecordingsRouter = require('./api/callRecordings');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', callRecordingsRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});