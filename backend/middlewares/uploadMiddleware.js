const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Path folder penyimpanan uploads
const uploadDir = path.join(__dirname, '../uploads');

// Buat folder jika belum ada (Robust folder check)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate nama file unik: timestamp + acak + ekstensi asli
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'bukti-' + uniqueSuffix + ext);
  }
});

// Filter File (Hanya menerima gambar: png, jpg, jpeg)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return cb(null, true);
  }
  cb(new Error('Tipe file tidak didukung. Hanya gambar (JPG, JPEG, PNG) yang diperbolehkan!'));
};

// Inisialisasi Multer dengan limit 2MB
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2 MB
});

module.exports = upload;
