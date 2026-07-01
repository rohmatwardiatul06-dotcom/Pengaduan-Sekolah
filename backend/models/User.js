const db = require('../config/db');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.created_at = data.created_at;
  }

  // Find a user by email
  static async findByEmail(email) {
    const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return null;
    return new User(rows[0]);
  }

  // Find a user by username
  static async findByUsername(username) {
    const rows = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return null;
    return new User(rows[0]);
  }

  // Find a user by ID
  static async findById(id) {
    const rows = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return new User(rows[0]);
  }

  // Create a new user
  static async create({ username, email, password, role }) {
    const result = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, password, role || 'user']
    );
    return result.insertId;
  }

  // Find all users (excluding passwords for safety)
  static async findAll() {
    const rows = await db.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
    return rows.map(row => new User(row));
  }

  // Update a user's role
  static async updateRole(id, role) {
    const result = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return result.affectedRows > 0;
  }
}

module.exports = User;
