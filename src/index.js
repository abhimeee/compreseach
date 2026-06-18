const express = require('express');
const bodyParser = require('body-parser');
const callRecordingsApi = require('./api/callRecordingsApi');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', callRecordingsApi);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});