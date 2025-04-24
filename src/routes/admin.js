const express = require('express');
const { adminLogin, getStudents, getStudentById, updateStudent, deleteStudent } = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');
const { adminLoginSchema, updateStudentSchema } = require('../validators/adminValidator');
const validate = require('../middleware/validate');
const router = express.Router();

// Admin login route
router.post('/login', validate(adminLoginSchema), adminLogin);
// Get all students
router.get('/students', authenticateAdmin, getStudents);
// Get single student by ID
router.get('/students/:id', authenticateAdmin, getStudentById);
// Update single student by ID
router.post('/students/:id', authenticateAdmin, validate(updateStudentSchema), updateStudent);
// Delete single student by ID (soft delete)
router.post('/students/:id/delete', authenticateAdmin, deleteStudent);

module.exports = router;
