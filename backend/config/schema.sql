-- Skema Database Sistem Pengaduan Sekolah
-- Silakan jalankan file SQL ini di MySQL Server Anda (misal via phpMyAdmin atau mysql CLI)

CREATE DATABASE IF NOT EXISTS db_pengaduan_sekolah;
USE db_pengaduan_sekolah;

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabel Complaints (Pengaduan)
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('Fasilitas', 'Akademik', 'Disiplin & Bullying', 'Administrasi & Keuangan') NOT NULL,
  status ENUM('pending', 'proses', 'selesai') DEFAULT 'pending',
  image_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed Data Awal untuk Demo (Opsional)
-- Akun Admin Default:
-- Email: admin@school.com | Password: admin123
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@school.com', '$2a$10$UdEow8k4csUoAKnuwphfd.aRPC3Wctk/b9BgYPdnh5mGqJzd6oaLy', 'admin');
