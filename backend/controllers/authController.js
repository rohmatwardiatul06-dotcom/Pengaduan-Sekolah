const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ message: 'Username harus minimal 3 karakter.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Format email tidak valid.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password harus minimal 6 karakter.' });
    }

    // Check if user already exists (email)
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    // Check if user already exists (username)
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username sudah digunakan.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to DB
    const userId = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'user'
    });

    res.status(201).json({
      message: 'Registrasi berhasil. Silakan login.',
      userId
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ message: 'Email harus diisi.' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password harus diisi.' });
    }

    // Find User
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Email atau password salah.' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau password salah.' });
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'supersecretkey123_uas_pengaduan_sekolah',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['guru', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid. Hanya bisa merubah ke guru atau user.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Tidak bisa mengubah role Admin Utama.' });
    }

    await User.updateRole(id, role);
    res.status(200).json({ message: `Role berhasil diperbarui menjadi ${role}.` });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getUsers, updateUserRole };
