const express = require('express');
const {
    uploadStudentCSV,
    getStudents,
    addStudent,
    updateStudent,
    deactivateStudent,
    downloadStudents
} = require('../controllers/student.controller');
const auth = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(auth);

router.post('/upload', upload.single('file'), uploadStudentCSV);
router.get('/', getStudents);
router.post('/', addStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deactivateStudent);
router.get('/download', downloadStudents);

module.exports = router;