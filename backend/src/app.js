const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors(
    {
        origin: 'http://localhost:4200',
        credentials: true
    }
));
app.use(express.json({ limit: '10mb' }));

const logger = require('./middleware/logger');
app.use(logger);

console.log('Loading auth routes...');
app.use('/api/auth', require('./routes/auth.routes'));
console.log('Auth routes loaded.');

app.use('/api/students', require('./routes/student.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.post('/api/test', (req, res) => {
    res.json({ ok: true });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;