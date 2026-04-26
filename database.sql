-- Crear base de datos
CREATE DATABASE IF NOT EXISTS monterrey_reporta;
USE monterrey_reporta;

-- Tabla de usuarios
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Tabla de reportes
CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(500) NOT NULL,
  municipality VARCHAR(100) NOT NULL,
  description LONGTEXT NOT NULL,
  status ENUM('Pendiente', 'En proceso', 'Resuelto') DEFAULT 'Pendiente',
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_municipality (municipality)
);

-- Tabla de evidencia
CREATE TABLE evidence (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL UNIQUE,
  photo_url VARCHAR(500),
  comments LONGTEXT,
  admin_id INT,
  admin_name VARCHAR(255),
  resolution_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insertar usuarios de prueba
-- Contraseñas: 'password123' para ambas
INSERT INTO users (name, email, password, role) VALUES
('Administrador', 'admin@monterrey.mx', '$2a$10$YAqIm4YqCMkxPaYqqV.xaeKYR3hcjMqDhMsKDL5v5qzPDvqRrP5nW', 'admin'),
('Juan Pérez', 'juan@example.com', '$2a$10$YAqIm4YqCMkxPaYqVw.xaeKYR3hcjMqDhMsKDL5v5qzPDvqRrP5nW', 'user');
