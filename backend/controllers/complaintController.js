const Complaint = require('../models/Complaint');

// Get all complaints (with query search and status filters)
const getComplaints = async (req, res, next) => {
  try {
    const { search, status, category } = req.query;
    const { id: userId, role } = req.user;

    const complaints = await Complaint.findAll({
      userId,
      role,
      search,
      status,
      category
    });

    res.status(200).json({
      message: 'Berhasil mengambil data pengaduan.',
      data: complaints
    });
  } catch (error) {
    next(error);
  }
};

// Get a complaint by ID
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Pengaduan tidak ditemukan.' });
    }

    // Authorization: User can only see their own complaint. Admin can see any.
    if (role !== 'admin' && complaint.user_id !== userId) {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak berwenang melihat pengaduan ini.' });
    }

    res.status(200).json({
      message: 'Berhasil mengambil detail pengaduan.',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

const createComplaint = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.user.id;

    // Backend Validation
    if (!title || title.trim().length < 5) {
      return res.status(400).json({ message: 'Judul pengaduan harus minimal 5 karakter.' });
    }
    if (!content || content.trim().length < 15) {
      return res.status(400).json({ message: 'Isi laporan harus menjelaskan detail laporan (minimal 15 karakter).' });
    }
    
    const validCategories = ['Fasilitas', 'Akademik', 'Disiplin & Bullying', 'Administrasi & Keuangan'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ message: 'Kategori pengaduan tidak valid.' });
    }

    // Handle Uploaded File
    let imageUrl = null;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const complaintId = await Complaint.create({
      userId,
      title: title.trim(),
      content: content.trim(),
      category,
      imageUrl
    });

    res.status(201).json({
      message: 'Laporan pengaduan berhasil dibuat.',
      complaintId
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing complaint
const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category, status } = req.body;
    const { id: userId, role } = req.user;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Pengaduan tidak ditemukan.' });
    }

    // Authorization Check
    if (role !== 'admin') {
      // User can only update their own complaint
      if (complaint.user_id !== userId) {
        return res.status(403).json({ message: 'Akses ditolak. Anda tidak berwenang mengedit pengaduan ini.' });
      }
      
      // User can only update if status is still pending
      if (complaint.status !== 'pending') {
        return res.status(400).json({ message: 'Laporan tidak dapat diubah karena sedang diproses atau sudah selesai.' });
      }

      // User cannot update status
      if (status !== undefined && status !== complaint.status) {
        return res.status(400).json({ message: 'User tidak berwenang mengubah status pengaduan.' });
      }
    }

    // If validating inputs for non-admin updates
    if (role !== 'admin') {
      if (title !== undefined && title.trim().length < 5) {
        return res.status(400).json({ message: 'Judul pengaduan harus minimal 5 karakter.' });
      }
      if (content !== undefined && content.trim().length < 15) {
        return res.status(400).json({ message: 'Isi laporan harus menjelaskan detail laporan (minimal 15 karakter).' });
      }
      
      const validCategories = ['Fasilitas', 'Akademik', 'Disiplin & Bullying', 'Administrasi & Keuangan'];
      if (category !== undefined && !validCategories.includes(category)) {
        return res.status(400).json({ message: 'Kategori pengaduan tidak valid.' });
      }
    }

    // If Admin is updating status
    if (role === 'admin' && status !== undefined) {
      const validStatuses = ['pending', 'proses', 'selesai', 'ditolak'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Status pengaduan tidak valid.' });
      }
    }

    // Handle Uploaded File for Edit
    let imageUrl = undefined;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const updated = await Complaint.update(id, {
      title,
      content,
      category,
      status,
      imageUrl
    });

    if (!updated) {
      return res.status(400).json({ message: 'Tidak ada perubahan data yang disimpan.' });
    }

    res.status(200).json({ message: 'Pengaduan berhasil diperbarui.' });
  } catch (error) {
    next(error);
  }
};

// Delete a complaint
const deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Pengaduan tidak ditemukan.' });
    }

    // Authorization Check
    if (role !== 'admin') {
      // User can only delete their own
      if (complaint.user_id !== userId) {
        return res.status(403).json({ message: 'Akses ditolak. Anda tidak berwenang menghapus pengaduan ini.' });
      }
      // User can only delete if status is pending
      if (complaint.status !== 'pending') {
        return res.status(400).json({ message: 'Laporan tidak dapat dihapus karena sudah dalam proses atau selesai.' });
      }
    }

    const deleted = await Complaint.delete(id);

    if (!deleted) {
      return res.status(400).json({ message: 'Gagal menghapus pengaduan.' });
    }

    res.status(200).json({ message: 'Pengaduan berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

// Get statistics
const getStats = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    const stats = await Complaint.getStats(userId, role);
    res.status(200).json({
      message: 'Berhasil mengambil statistik pengaduan.',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getStats
};
