const express = require('express');
const router = express.Router();
// Import controller autentikasi
const { register, login } = require('../controllers/authController');

// Route untuk Registrasi User Baru
// URL: http://localhost:5000/api/auth/register
router.post('/register', register);

// Route untuk Login User
// URL: http://localhost:5000/api/auth/login
router.post('/login', login);

module.exports = router;