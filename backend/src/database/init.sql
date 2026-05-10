CREATE DATABASE IF NOT EXISTS booking_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE booking_db;

CREATE TABLE IF NOT EXISTS bookings (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(20)  NOT NULL,
  service    VARCHAR(100) NOT NULL,
  book_date  DATE         NOT NULL,
  book_time  TIME         NOT NULL,
  status     ENUM('pending','confirmed','cancelled')
             NOT NULL DEFAULT 'pending',
  note       TEXT,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
             ON UPDATE CURRENT_TIMESTAMP
);

-- Seed data để test
INSERT INTO bookings (name, phone, service, book_date, book_time)
VALUES
  ('Nguyen Van A', '0901234567', 'Cắt tóc', '2025-06-01', '09:00:00'),
  ('Tran Thi B',   '0912345678', 'Gội đầu', '2025-06-01', '10:30:00'),
  ('Le Van C',     '0923456789', 'Nhuộm tóc','2025-06-02', '14:00:00');