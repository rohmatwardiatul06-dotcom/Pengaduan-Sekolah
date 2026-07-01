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

    // Authorization: User can only see their own complaint. Admin & Guru can see any.
    if (role !== 'admin' && role !== 'guru' && complaint.user_id !== userId) {
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
    const body = req.body || {};
    const title = body.title;
    const content = body.content;
    const category = body.category;
    const userId = req.user.id;

    // Backend Validation
    if (!title || title.trim().length < 5) {
      return res.status(400).json({ message: 'Judul pengaduan harus minimal 5 karakter.' });
    }
    if (!content || content.trim().length < 15) {
      return res.status(400).json({ message: 'Isi laporan harus menjelaskan detail laporan (minimal 15 karakter).' });
    }
    
    const validCategories = ['Fasilitas', 'Akademik', 'Disiplin & Bullying', 'Administrasi & Keuangan', 'Lainnya'];
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
      imageUrl: imageUrl
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
    const { title, content, category, status, admin_comment } = req.body || {};
    const { id: userId, role } = req.user;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Pengaduan tidak ditemukan.' });
    }

    // Authorization Check
    if (role !== 'admin' && role !== 'guru') {
      if (complaint.user_id !== userId) {
        return res.status(403).json({ message: 'Akses ditolak. Anda tidak berwenang mengakses pengaduan ini.' });
      }
      
      const isEditingDetails = title !== undefined || content !== undefined || category !== undefined || (status !== undefined && status !== complaint.status);
      if (isEditingDetails) {
        if (complaint.status !== 'pending') {
          return res.status(400).json({ message: 'Laporan tidak dapat diubah karena sedang diproses atau sudah selesai.' });
        }
        if (status !== undefined && status !== complaint.status) {
          return res.status(400).json({ message: 'User tidak berwenang mengubah status pengaduan.' });
        }
      }
    }

    // Input Validation for non-admin and non-guru updates (only if fields are being updated)
    if (role !== 'admin' && role !== 'guru') {
      if (title !== undefined && title.trim().length < 5) {
        return res.status(400).json({ message: 'Judul pengaduan harus minimal 5 karakter.' });
      }
      if (content !== undefined && content.trim().length < 15) {
        return res.status(400).json({ message: 'Isi laporan harus menjelaskan detail laporan (minimal 15 karakter).' });
      }
      
      const validCategories = ['Fasilitas', 'Akademik', 'Disiplin & Bullying', 'Administrasi & Keuangan', 'Lainnya'];
      if (category !== undefined && !validCategories.includes(category)) {
        return res.status(400).json({ message: 'Kategori pengaduan tidak valid.' });
      }
    }

    // Admin & Guru status validation
    if ((role === 'admin' || role === 'guru') && status !== undefined) {
      const validStatuses = ['pending', 'proses', 'selesai', 'ditolak'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Status pengaduan tidak valid.' });
      }
    }

    // PERBAIKAN LOGIKA GAMBAR: Jika tidak upload gambar baru, pakai gambar yang lama agar tidak ter-reset jadi null/undefined
    let imageUrl = complaint.image_url; 
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    let finalAdminComment = complaint.admin_comment;

    if (admin_comment !== undefined && admin_comment.trim() !== '') {
      const commentsList = [];
      if (complaint.admin_comment) {
        try {
          const parsed = JSON.parse(complaint.admin_comment);
          if (Array.isArray(parsed)) {
            commentsList.push(...parsed);
          } else {
            commentsList.push({
              sender_role: 'admin',
              sender_name: 'Admin',
              text: complaint.admin_comment,
              created_at: complaint.updated_at || new Date().toISOString()
            });
          }
        } catch (e) {
          commentsList.push({
            sender_role: 'admin',
            sender_name: 'Admin',
            text: complaint.admin_comment,
            created_at: complaint.updated_at || new Date().toISOString()
          });
        }
      }

      commentsList.push({
        sender_role: role,
        sender_name: req.user.username,
        text: admin_comment.trim(),
        created_at: new Date().toISOString()
      });

      finalAdminComment = JSON.stringify(commentsList);
    }

    const updated = await Complaint.update(id, {
      title: title !== undefined ? title.trim() : complaint.title,
      content: content !== undefined ? content.trim() : complaint.content,
      category: category || complaint.category,
      status: status || complaint.status,
      imageUrl: imageUrl,
      adminComment: finalAdminComment
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

    if (role !== 'admin') {
      if (complaint.user_id !== userId) {
        return res.status(403).json({ message: 'Akses ditolak. Anda tidak berwenang menghapus pengaduan ini.' });
      }
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