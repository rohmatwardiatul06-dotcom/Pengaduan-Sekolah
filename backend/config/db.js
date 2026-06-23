const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'db_pengaduan_sekolah',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    this.testConnection();
  }

  async testConnection() {
    try {
      const connection = await this.pool.getConnection();
      console.log('Connected to MySQL Database successfully.');
      connection.release();
    } catch (error) {
      console.error('MySQL connection failed. Did you import schema.sql? Error:', error.message);
    }
  }

  /**
   * Execute query with parameters
   * @param {string} sql - SQL query string
   * @param {Array} params - parameters array
   * @returns {Promise<Array>} query results
   */
  async query(sql, params) {
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database Query Error:', error.message);
      throw error;
    }
  }
}

const db = new Database();
module.exports = db;
