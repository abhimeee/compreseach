'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const callRecordingsRoute = require('./api/callRecordings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', callRecordingsRoute);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});