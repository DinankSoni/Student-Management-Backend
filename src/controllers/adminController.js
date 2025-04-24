const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Admin login function
const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if admin exists by username or email
    const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const admin = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all students
const getStudents = async (req, res) => {
  try {
    const [students] = await db.query('SELECT id, name, email, created_at, updated_at, profile_picture FROM students WHERE isDeleted = ?', [false]);
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT name, email, profile_picture, created_at, updated_at FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update student information
const updateStudent = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if student exists
    const [rows] = await db.query('SELECT email FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });

    const currentStudent = rows[0];

    // Check email uniqueness if provided
    if (email && email !== currentStudent.email) {
      const [emailCheck] = await db.query('SELECT * FROM students WHERE email = ? AND id != ?', [email, req.params.id]);
      if (emailCheck.length > 0) return res.status(400).json({ error: 'Email already exists' });
    }

    // Build dynamic update query
    let query = 'UPDATE students SET';
    let params = [];
    let updates = [];

    if (name) {
      updates.push(' name = ?');
      params.push(name);
    }

    if (email) {
      updates.push(' email = ?');
      params.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(' password = ?');
      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    query += updates.join(',') + ' WHERE id = ?';
    params.push(req.params.id);

    // Execute update
    await db.query(query, params);
    res.json({ message: 'Student profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete student (soft delete)
const deleteStudent = async (req, res) => {
  try {
    // Check if student exists and is not already deleted
    const [rows] = await db.query('SELECT * FROM students WHERE id = ? AND isDeleted = ?', [req.params.id, false])
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' })

    // Perform soft delete by setting isDeleted to true
    await db.query('UPDATE students SET isDeleted = ? WHERE id = ?', [true, req.params.id])
    res.json({ message: 'Student deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

// Export functions
module.exports = { adminLogin, getStudents, getStudentById, updateStudent, deleteStudent };

