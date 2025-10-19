const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const z = require('zod');

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').trim(),
    email: z.string().email('Invalid email format').trim().toLowerCase(),
    mobile: z
        .string()
        .transform((val) => val.replace(/\D/g, '')) 
        .refine((val) => /^\d{10,15}$/.test(val), {
            message: 'Mobile must contain 10 to 15 digits',
        }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

async function register(req, res) {
    try {
        const validated = registerSchema.parse(req.body);
        const { username, email, mobile, password } = validated;

        const dupCheck = await pool.query(
            `SELECT id FROM users 
       WHERE username = $1 OR email = $2 OR mobile = $3`,
            [username, email, mobile]
        );

        if (dupCheck.rows.length > 0) {
            return res.status(400).json({
                error: 'Duplicate username, email, or mobile number',
            });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            `INSERT INTO users (username, email, mobile, password_hash, role) 
       VALUES ($1, $2, $3, $4, 'teacher') 
       RETURNING id, username, email, created_at`,
            [username, email, mobile, passwordHash]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: err.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            });
        }
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Failed to register teacher' });
    }
}

async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const userResult = await pool.query(
            'SELECT id, username, password_hash, role FROM users WHERE username = $1 AND role = $2',
            [username, 'teacher']
        );

        const user = userResult.rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        await pool.query(
            `INSERT INTO login_logs (user_id, role, ip_address) 
       VALUES ($1, $2, $3)`,
            [user.id, user.role, req.ip || '0.0.0.0']
        );

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
}

async function studentLogin(req, res) {
    const { username, password } = req.body;

    const student = await pool.query(
        `SELECT id, username, password_hash FROM students 
     WHERE username = $1 AND is_active = true`,
        [username]
    );

    if (student.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const valid = await bcrypt.compare(password, student.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    await pool.query(
        `INSERT INTO login_logs (user_id, role, ip_address) VALUES ($1, 'student', $2)`,
        [student.rows[0].id, req.ip || '0.0.0.0']
    );

    const token = jwt.sign(
        { id: student.rows[0].id, role: 'student' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.json({
        token,
        user: { id: student.rows[0].id, username: student.rows[0].username, role: 'student' }
    });
}

module.exports = { register, login, studentLogin };