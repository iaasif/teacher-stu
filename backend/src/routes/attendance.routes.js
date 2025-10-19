const express = require('express');
const {
    markAttendance,
    getAttendance,
    getOwnAttendance
} = require('../controllers/attendance.controller');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getAttendance);

router.post('/mark', auth, markAttendance);
router.get('/me', auth, getOwnAttendance);

module.exports = router;