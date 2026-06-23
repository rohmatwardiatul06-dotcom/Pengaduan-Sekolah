const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getStats
} = require('../controllers/complaintController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Proteksi seluruh route pengaduan dengan token JWT
router.use(verifyToken);

// REST API Endpoints sesuai spesifikasi minimal
router.get('/data', getComplaints);
router.get('/data/:id', getComplaintById);
router.post('/data', createComplaint);
router.put('/data/:id', updateComplaint);
router.delete('/data/:id', deleteComplaint);

// Endpoint tambahan untuk visualisasi dashboard
router.get('/stats', getStats);

module.exports = router;
