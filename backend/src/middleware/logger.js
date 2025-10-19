

const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(path.join(__dirname, '../../app.log'), { flags: 'a' });

function logger(req, res, next) {
    const start = Date.now();
    const { method, url, headers, ip } = req;
    const userAgent = headers['user-agent'] || '';

    console.log(`→ ${method} ${url} | IP: ${ip || 'unknown'} | UA: ${userAgent}`);

    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = `[${new Date().toISOString()}] ${method} ${url} ${res.statusCode} | ${duration}ms | IP: ${ip || 'unknown'}\n`;
        logStream.write(log);
    });

    next();
}

module.exports = logger;