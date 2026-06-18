const express = require('express');
const fetchCallRecordings = require('./api/fetchCallRecordings');

const app = express();

app.use(express.json());
app.use('/api', fetchCallRecordings); // Use the API for call recordings

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});