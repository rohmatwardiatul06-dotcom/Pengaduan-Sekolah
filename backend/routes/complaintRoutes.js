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
const upload = require('../middlewares/uploadMiddleware'); 

// 2. Sekarang baru aman memanggil router.use karena variabel router sudah ada
router.use(verifyToken);

// REST API Endpoints 
router.get('/data', getComplaints);
router.get('/data/:id', getComplaintById);

// Jangan lupa pasang upload.single('image') di sini ya!
router.post('/data', upload.single('image'), createComplaint);
router.put('/data/:id', upload.single('image'), updateComplaint);

router.delete('/data/:id', deleteComplaint);
router.get('/stats', getStats);

module.exports = router;