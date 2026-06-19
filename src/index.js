const express = require('express');
const app = express();
const dotenv = require('dotenv');
const callRecordings = require('./api/callRecordings');

dotenv.config();

app.use(express.json());
app.use('/api', callRecordings);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});