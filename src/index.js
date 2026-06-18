import express from 'express';
import callRecordingsRouter from './api/callRecordings.js';

const app = express();

// Middleware to parse JSON body
app.use(express.json());

// Use the call recordings router
app.use('/api', callRecordingsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});