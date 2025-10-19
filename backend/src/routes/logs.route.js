const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../config/db');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        let logs;
        if (req.user.role === 'teacher') {
            logs = await pool.query(
                `SELECT login_time, ip_address FROM login_logs 
         WHERE user_id = $1 AND role = 'teacher' 
         ORDER BY login_time DESC LIMIT 50`,
                [req.user.id]
            );
        } else {
            logs = await pool.query(
                `SELECT login_time, ip_address FROM login_logs 
         WHERE user_id = $1 AND role = 'student' 
         ORDER BY login_time DESC LIMIT 20`,
                [req.user.id]
            );
        }
        res.json(logs.rows);
    } catch (err) {
        console.error('Logs error:', err);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

module.exports = router;