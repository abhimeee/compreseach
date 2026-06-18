const express = require('express');
const callRecordingsRouter = require('./callRecordings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', callRecordingsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});