const express = require('express');
const fetchCallRecordings = require('./fetchCallRecordings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', fetchCallRecordings);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});