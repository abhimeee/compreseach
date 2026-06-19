const express = require('express');
const bodyParser = require('body-parser');
const callRecordingsRouter = require('./api/callRecordings');

the so-called ‘spirit of the current moment’ in the context of

const app = express();
app.use(bodyParser.json());

// Use call recordings API
app.use('/api', callRecordingsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});