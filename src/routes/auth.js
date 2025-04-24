const express = require('express');
const { register, login } = require('../controllers/authController');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const router = express.Router();

// Register route
router.post('/register', validate(registerSchema), register);

// Login route
router.post('/login', validate(loginSchema), login);

module.exports = router;
