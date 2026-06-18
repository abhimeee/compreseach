const express = require('express');
const app = express();
const callRecordingsApi = require('./api/callRecordings');

app.use(express.json());
app.use('/api', callRecordingsApi);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});