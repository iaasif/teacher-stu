const pool = require('../config/db');

async function markAttendance(req, res) {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Only students can mark attendance' });
    }

    const studentId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    try {
        const existing = await pool.query(
            `SELECT id FROM attendance WHERE student_id = $1 AND date = $2`,
            [studentId, today]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Attendance already marked for today' });
        }

        await pool.query(
            `INSERT INTO attendance (student_id, date, is_present) VALUES ($1, $2, true)`,
            [studentId, today]
        );

        res.json({ message: 'Attendance marked for today' });
    } catch (err) {
        console.error('Mark attendance error:', err);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
}

async function getAttendance(req, res) {
    const teacherId = req.user.id;
    try {
        const result = await pool.query(`
      SELECT 
        s.name, s.username, a.date, a.is_present
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE s.teacher_id = $1
      ORDER BY a.date DESC, s.name
    `, [teacherId]);

        res.json(result.rows);
    } catch (err) {
        console.error('Get attendance error:', err);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
}

async function getOwnAttendance(req, res) {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const result = await pool.query(
            `SELECT date, is_present FROM attendance WHERE student_id = $1 ORDER BY date DESC`,
            [req.user.id]
        );

        const present = result.rows.filter(r => r.is_present).length;
        const absent = result.rows.length - present;

        res.json({
            records: result.rows,
            summary: { present, absent }
        });
    } catch (err) {
        console.error('Own attendance error:', err);
        res.status(500).json({ error: 'Failed to fetch your attendance' });
    }
}

module.exports = { markAttendance, getAttendance, getOwnAttendance };