const express = require('express');
const callRecordings = require('./api/callRecordings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', callRecordings);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});