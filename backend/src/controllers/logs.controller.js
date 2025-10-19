async function getLoginLogs(req, res) {
    const { id, role } = req.user;

    const result = await pool.query(
        `SELECT login_time, ip_address 
     FROM login_logs 
     WHERE user_id = $1 AND role = $2 
     ORDER BY login_time DESC 
     LIMIT ${role === 'teacher' ? 50 : 20}`,
        [id, role]
    );

    res.json(result.rows);
}