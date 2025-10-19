const express = require('express');
const { register, login, studentLogin } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/student-login', studentLogin); // ← now studentLogin is defined

module.exports = router;