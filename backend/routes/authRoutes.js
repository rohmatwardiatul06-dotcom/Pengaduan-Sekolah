const express = require('express');
const router = express.Router();
// Import controller autentikasi
const { register, login, getUsers, updateUserRole } = require('../controllers/authController');
const { verifyToken, adminOnly } = require('../middlewares/authMiddleware');

// Route untuk Registrasi User Baru
// URL: http://localhost:5000/register
router.post('/register', register);

// Route untuk Login User
// URL: http://localhost:5000/login
router.post('/login', login);

// Route untuk Kelola Pengguna (Admin Utama saja)
// URL: http://localhost:5000/users
router.get('/users', verifyToken, adminOnly, getUsers);
router.put('/users/:id/role', verifyToken, adminOnly, updateUserRole);

module.exports = router;