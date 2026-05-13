CREATE DATABASE IF NOT EXISTS booking_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE booking_db;

CREATE TABLE IF NOT EXISTS bookings (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(20)  NOT NULL,
  email      VARCHAR(160),
  service    VARCHAR(100) NOT NULL,
  book_date  DATE         NOT NULL,
  book_time  TIME         NOT NULL,
  status     ENUM('pending','confirmed','cancelled','completed')
             NOT NULL DEFAULT 'pending',
  note       TEXT,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
             ON UPDATE CURRENT_TIMESTAMP
);

