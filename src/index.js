const express = require('express');
const fetchCallRecordings = require('./api/fetchCallRecordings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Use the call recordings API
app.use('/api', fetchCallRecordings);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});