const jwt = require('jsonwebtoken');
const pool = require('../config/db');


async function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { id, role } = decoded;

        let user;
        if (role === 'teacher') {
            const result = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [id]);
            user = result.rows[0];
        } else if (role === 'student') {
            const result = await pool.query(
                'SELECT id, username FROM students WHERE id = $1 AND is_active = true',
                [id]
            );
            if (result.rows[0]) {
                user = { ...result.rows[0], role: 'student' };
            }
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid or inactive user' });
        }

        req.user = user; 
        next();
    } catch (err) {
        console.error('Auth error:', err.message);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = auth;