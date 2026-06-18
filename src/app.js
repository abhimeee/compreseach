const express = require('express');
const callRecordingsRoutes = require('./api/callRecordings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', callRecordingsRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});