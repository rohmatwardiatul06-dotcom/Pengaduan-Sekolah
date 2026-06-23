const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*', // Di production, batasi ke URL frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logging Middleware sederhana
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root route welcome message
app.get('/', (req, res) => {
  res.json({
    message: 'Selamat datang di API Sistem Pengaduan Sekolah!',
    status: 'Running'
  });
});

// Mounting Routes langsung di root '/' sesuai spesifikasi endpoint minimal
app.use('/', authRoutes);
app.use('/', complaintRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
