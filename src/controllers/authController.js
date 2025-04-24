const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register a new student
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email already exists
    const [rows] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
    if (rows.length > 0) return res.status(400).json({ error: 'Email already exists' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new student into database
    const [result] = await db.query(
      'INSERT INTO students (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Fetch the created student to include created_at
    const [newStudent] = await db.query('SELECT id, name, email, created_at FROM students WHERE id = ?', [result.insertId]);

    res.status(201).json({ message: 'Registration successful', student: newStudent[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login an existing student
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if student exists and is not deleted
    const [rows] = await db.query('SELECT * FROM students WHERE email = ? AND isDeleted = ?', [email, false]);
    if (rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const student = rows[0];

    // Verify the password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate a JSON Web Token
    const token = jwt.sign(
      { id: student.id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login };
