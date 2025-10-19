const pool = require('../config/db');
const csvParser = require('../utils/csvParser');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const bcrypt = require('bcrypt');

const studentSchema = {
    username: (v) => typeof v === 'string' && v.length >= 3,
    email: (v) => typeof v === 'string' && /\S+@\S+\.\S+/.test(v),
    mobile: (v) => typeof v === 'string' && /^\d{10,15}$/.test(v),
    name: (v) => typeof v === 'string' && v.trim().length > 0
};

function validateStudent(data) {
    const errors = [];

    const cleanMobile = data.mobile?.replace(/\D/g, '') || '';

    if (!data.username || data.username.length < 3) {
        errors.push('username is invalid');
    }
    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
        errors.push('email is invalid');
    }
    if (!/^\d{10,15}$/.test(cleanMobile)) {
        errors.push('mobile must be 10–15 digits');
    }
    if (!data.name || data.name.trim().length === 0) {
        errors.push('name is invalid');
    }

    return { errors, cleanMobile };
}


async function uploadStudentCSV(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const rows = await csvParser.parseCSV(req.file.path);
        const teacherId = req.user.id;

        const duplicates = [];
        const validStudents = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if (!row.password || row.password.length < 6) {
                await unlinkAsync(req.file.path);
                return res.status(400).json({ error: `Row ${i + 2}: password must be at least 6 characters` });
            }

            const cleanMobile = row.mobile?.replace(/\D/g, '') || '';
            if (!/^\d{10,15}$/.test(cleanMobile)) {
                await unlinkAsync(req.file.path);
                return res.status(400).json({ error: `Row ${i + 2}: mobile must be 10–15 digits` });
            }

            if (!row.username || row.username.length < 3) {
                await unlinkAsync(req.file.path);
                return res.status(400).json({ error: `Row ${i + 2}: invalid username` });
            }
            if (!row.email || !/\S+@\S+\.\S+/.test(row.email)) {
                await unlinkAsync(req.file.path);
                return res.status(400).json({ error: `Row ${i + 2}: invalid email` });
            }
            if (!row.name || row.name.trim().length === 0) {
                await unlinkAsync(req.file.path);
                return res.status(400).json({ error: `Row ${i + 2}: invalid name` });
            }

            const dup = await pool.query(
                `SELECT id FROM students 
         WHERE (username = $1 OR email = $2 OR mobile = $3) AND teacher_id = $4`,
                [row.username, row.email, cleanMobile, teacherId]
            );

            if (dup.rows.length > 0) {
                duplicates.push({ line: i + 2, username: row.username });
            } else {
                const passwordHash = await bcrypt.hash(row.password, 10);
                validStudents.push({
                    ...row,
                    mobile: cleanMobile,
                    passwordHash
                });
            }
        }

        if (duplicates.length > 0) {
            await unlinkAsync(req.file.path);
            return res.status(400).json({
                error: 'Duplicate entries found',
                duplicates
            });
        }

        for (const s of validStudents) {
            await pool.query(
                `INSERT INTO students (username, email, mobile, name, password_hash, teacher_id) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [s.username, s.email, s.mobile, s.name, s.passwordHash, teacherId]
            );
        }

        await unlinkAsync(req.file.path);
        res.status(201).json({ message: `${validStudents.length} students added` });

    } catch (err) {
        console.error('CSV upload error:', err);
        if (req.file?.path) await unlinkAsync(req.file.path).catch(() => { });
        res.status(500).json({ error: 'Failed to process CSV' });
    }
}

async function getStudents(req, res) {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    const teacherId = req.user.id;

    try {
        const countQuery = `
      SELECT COUNT(*) FROM students 
      WHERE teacher_id = $1 AND is_active = true
      ${search ? `AND (name ILIKE $2 OR username ILIKE $2 OR email ILIKE $2)` : ''}
    `;
        const countValues = [teacherId];
        if (search) countValues.push(`%${search}%`);

        const total = await pool.query(countQuery, countValues);
        const totalPages = Math.ceil(total.rows[0].count / limit);

        const dataQuery = `
      SELECT id, username, email, mobile, name, is_active, created_at
      FROM students 
      WHERE teacher_id = $1 AND is_active = true
      ${search ? `AND (name ILIKE $${search ? 3 : 2} OR username ILIKE $${search ? 3 : 2} OR email ILIKE $${search ? 3 : 2})` : ''}
      ORDER BY created_at DESC
      LIMIT $${search ? 4 : 2} OFFSET $${search ? 5 : 3}
    `;

        const dataValues = [teacherId];
        if (search) dataValues.push(`%${search}%`);
        dataValues.push(limit, offset);

        const result = await pool.query(dataQuery, dataValues);

        res.json({
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(total.rows[0].count),
                totalPages
            }
        });
    } catch (err) {
        console.error('Get students error:', err);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
}

async function addStudent(req, res) {
    const { username, email, mobile, name, password } = req.body;
    const teacherId = req.user.id;

    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const cleanMobile = mobile?.replace(/\D/g, '') || '';
    if (!/^\d{10,15}$/.test(cleanMobile)) {
        return res.status(400).json({ error: 'Mobile must contain 10 to 15 digits' });
    }

    if (!username || username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const dup = await pool.query(
            `SELECT id FROM students 
       WHERE (username = $1 OR email = $2 OR mobile = $3) AND teacher_id = $4`,
            [username, email, cleanMobile, teacherId]
        );

        if (dup.rows.length > 0) {
            return res.status(400).json({ error: 'Duplicate username, email, or mobile' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO students (username, email, mobile, name, password_hash, teacher_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, username, email, mobile, name, created_at`,
            [username, email, cleanMobile, name, passwordHash, teacherId]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Add student error:', err);
        res.status(500).json({ error: 'Failed to add student' });
    }
}

async function updateStudent(req, res) {
    const { id } = req.params;
    const { username, email, mobile, name } = req.body;
    const teacherId = req.user.id;

    const errors = validateStudent({ username, email, mobile, name });
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
    }
    const dup = await pool.query(
        `SELECT id FROM students WHERE (username = $1 OR email = $2 OR mobile = $3) AND teacher_id = $4`,
        [username, email, cleanMobile, teacherId] 
    );
    try {
        const student = await pool.query(
            `SELECT id FROM students WHERE id = $1 AND teacher_id = $2`,
            [id, teacherId]
        );
        if (student.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const dup = await pool.query(
            `SELECT id FROM students 
       WHERE id != $1 AND (username = $2 OR email = $3 OR mobile = $4) AND teacher_id = $5`,
            [id, username, email, mobile, teacherId]
        );
        if (dup.rows.length > 0) {
            return res.status(400).json({ error: 'Duplicate username/email/mobile' });
        }

        const result = await pool.query(
            `UPDATE students 
       SET username = $1, email = $2, mobile = $3, name = $4 
       WHERE id = $5 RETURNING *`,
            [username, email, mobile, name, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update student error:', err);
        res.status(500).json({ error: 'Failed to update student' });
    }
}

async function deactivateStudent(req, res) {
    const { id } = req.params;
    const teacherId = req.user.id;

    try {
        const result = await pool.query(
            `UPDATE students SET is_active = false WHERE id = $1 AND teacher_id = $2 RETURNING id`,
            [id, teacherId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found or not yours' });
        }
        res.json({ message: 'Student deactivated' });
    } catch (err) {
        console.error('Deactivate error:', err);
        res.status(500).json({ error: 'Failed to deactivate student' });
    }
}

async function downloadStudents(req, res) {
    const teacherId = req.user.id;
    try {
        const result = await pool.query(
            `SELECT username, email, mobile, name FROM students 
       WHERE teacher_id = $1 AND is_active = true`,
            [teacherId]
        );

        const csvContent = [
            ['Username', 'Email', 'Mobile', 'Name'],
            ...result.rows.map(r => [r.username, r.email, r.mobile, r.name])
        ].map(e => e.join(',')).join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('students.csv');
        res.send(csvContent);
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
}


module.exports = {
    uploadStudentCSV,
    getStudents,
    addStudent,
    updateStudent,
    deactivateStudent,
    downloadStudents
};