const db = require('../config/db');

class Complaint {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.username = data.username; // Joined from users table
    this.title = data.title;
    this.content = data.content;
    this.category = data.category;
    this.status = data.status;
    this.image_url = data.image_url;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Find a single complaint by ID
  static async findById(id) {
    const rows = await db.query(
      `SELECT c.*, u.username FROM complaints c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    return new Complaint(rows[0]);
  }

  // Find all complaints with optional search and filters, and auth check
  static async findAll({ userId, role, search, status, category }) {
    let sql = `
      SELECT c.*, u.username FROM complaints c
      JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Authorization: Normal user can only see their own complaints, Admin can see all
    if (role !== 'admin' && userId) {
      sql += ' AND c.user_id = ?';
      params.push(userId);
    }

    // Search Query (title and content)
    if (search) {
      sql += ' AND (c.title LIKE ? OR c.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Status Filter
    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }

    // Category Filter
    if (category) {
      sql += ' AND c.category = ?';
      params.push(category);
    }

    sql += ' ORDER BY c.created_at DESC';

    const rows = await db.query(sql, params);
    return rows.map(row => new Complaint(row));
  }

  // Create a new complaint
  static async create({ userId, title, content, category, imageUrl }) {
    const result = await db.query(
      'INSERT INTO complaints (user_id, title, content, category, image_url) VALUES (?, ?, ?, ?, ?)',
      [userId, title, content, category, imageUrl || null]
    );
    return result.insertId;
  }

  // Update an existing complaint
  static async update(id, { title, content, category, status, imageUrl }) {
    const fields = [];
    const params = [];

    if (title !== undefined) { fields.push('title = ?'); params.push(title); }
    if (content !== undefined) { fields.push('content = ?'); params.push(content); }
    if (category !== undefined) { fields.push('category = ?'); params.push(category); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (imageUrl !== undefined) { fields.push('image_url = ?'); params.push(imageUrl); }

    if (fields.length === 0) return false;

    params.push(id);
    const result = await db.query(
      `UPDATE complaints SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  // Delete a complaint
  static async delete(id) {
    const result = await db.query('DELETE FROM complaints WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Calculate statistics (total, pending, proses, selesai)
  static async getStats(userId, role) {
    let sqlTotal = 'SELECT COUNT(*) as total FROM complaints';
    let sqlPending = "SELECT COUNT(*) as pending FROM complaints WHERE status = 'pending'";
    let sqlProses = "SELECT COUNT(*) as proses FROM complaints WHERE status = 'proses'";
    let sqlSelesai = "SELECT COUNT(*) as selesai FROM complaints WHERE status = 'selesai'";
    
    const params = [];
    if (role !== 'admin' && userId) {
      const filter = ' WHERE user_id = ?';
      sqlTotal += filter;
      sqlPending += ' AND user_id = ?';
      sqlProses += ' AND user_id = ?';
      sqlSelesai += ' AND user_id = ?';
      params.push(userId);
    }

    const [totalRes] = await db.query(sqlTotal, params);
    
    // Create copies of params for each query execution
    const pendingParams = [...params];
    const prosesParams = [...params];
    const selesaiParams = [...params];

    const [pendingRes] = await db.query(sqlPending, pendingParams);
    const [prosesRes] = await db.query(sqlProses, prosesParams);
    const [selesaiRes] = await db.query(sqlSelesai, selesaiParams);

    return {
      total: totalRes.total,
      pending: pendingRes.pending,
      proses: prosesRes.proses,
      selesai: selesaiRes.selesai
    };
  }
}

module.exports = Complaint;
