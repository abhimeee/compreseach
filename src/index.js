const express = require('express');
const callRecordingsRouter = require('./api/callRecordings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// API Routes
app.use('/api', callRecordingsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});