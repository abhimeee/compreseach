const express = require('express');
const callRecordingsRouter = require('./api/callRecordings');

dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
app.use('/api', callRecordingsRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});