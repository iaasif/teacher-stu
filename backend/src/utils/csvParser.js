const csv = require('csv-parser');
const fs = require('fs');

async function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('error', reject)
            .on('end', () => resolve(results));
    });
}

module.exports = { parseCSV };