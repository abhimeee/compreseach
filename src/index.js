const express = require('express');
const callRecordingsRoute = require('./api/callRecordings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', callRecordingsRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});