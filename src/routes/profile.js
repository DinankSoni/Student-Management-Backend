const express = require('express');
const multer = require('multer');
const { updateProfile, getProfile } = require('../controllers/profileController');
const { authenticateStudent } = require('../middleware/auth');
const { updateProfileSchema } = require('../validators/profileValidator');
const validate = require('../middleware/validate');
const router = express.Router();

// Multer setup with memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Images only (jpeg, jpg, png)'));
  },
});

router.get('/', authenticateStudent, getProfile);
// Update profile route with file upload
router.post('/', authenticateStudent, upload.single('profile_picture'), validate(updateProfileSchema), updateProfile);

module.exports = router;
