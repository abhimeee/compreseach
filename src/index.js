const express = require('express');
const bodyParser = require('body-parser');
const callRecordings = require('./api/callRecordings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', callRecordings);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});