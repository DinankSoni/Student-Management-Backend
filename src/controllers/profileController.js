const bcrypt = require('bcryptjs');
const db = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Update student profile
const updateProfile = async (req, res) => {
  const { name, email, password } = req.body
  let profilePictureUrl = null
  let publicId = null

  try {
    // Get current student data for profile picture cleanup and email comparison
    const [rows] = await db.query('SELECT email, profile_picture FROM students WHERE id = ? AND isDeleted = ?', [req.user.id, false])
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' })
    const currentStudent = rows[0]

    // Check email uniqueness if provided
    if (email && email !== currentStudent.email) {
      const [emailCheck] = await db.query('SELECT * FROM students WHERE email = ? AND id != ? AND isDeleted = ?', [email, req.user.id, false])
      if (emailCheck.length > 0) return res.status(400).json({ error: 'Email already exists' })
    }

    // Handle file upload to Cloudinary
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'student_profiles', resource_type: 'image' },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
          const bufferStream = new Readable()
          bufferStream.push(req.file.buffer)
          bufferStream.push(null)
          bufferStream.pipe(stream)
        })
        profilePictureUrl = result.secure_url
        publicId = result.public_id
      } catch (err) {
        throw new Error('Cloudinary upload failed')
      }
    }

    // Build update query dynamically
    let query = 'UPDATE students SET'
    let params = []
    let updates = []

    if (name) {
      updates.push(' name = ?')
      params.push(name)
    }

    if (email) {
      updates.push(' email = ?')
      params.push(email)
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updates.push(' password = ?')
      params.push(hashedPassword)
    }

    if (profilePictureUrl) {
      updates.push(' profile_picture = ?')
      params.push(profilePictureUrl)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' })
    }

    query += updates.join(',') + ' WHERE id = ? AND isDeleted = ?'
    params.push(req.user.id, false)

    // Execute update
    try {
      await db.query(query, params)
    } catch (err) {
      if (publicId) {
        await cloudinary.uploader.destroy(publicId)
      }
      throw err
    }

    // Delete old profile picture from Cloudinary if it exists
    if (profilePictureUrl && currentStudent.profile_picture) {
      const oldPublicId = currentStudent.profile_picture.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(`student_profiles/${oldPublicId}`)
    }

    res.json({ message: 'Profile updated successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

// Get student profile
const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT name, email, profile_picture, created_at, updated_at FROM students WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { updateProfile, getProfile };

