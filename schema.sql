-- ЛР4: база для audiox (MySQL / MariaDB). Импорт через phpMyAdmin или mysql CLI.
CREATE DATABASE IF NOT EXISTS audiox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE audiox;

-- Элементы списка на сайте (коллекция альбомов)
CREATE TABLE IF NOT EXISTS albums (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  country VARCHAR(120) NOT NULL,
  genre VARCHAR(120) NOT NULL,
  year SMALLINT NOT NULL,
  status ENUM('planned', 'listening', 'completed') NOT NULL DEFAULT 'planned',
  rating DECIMAL(4,1) NOT NULL,
  review TEXT NOT NULL,
  cover_url MEDIUMTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Обратная связь с формы на сайте
CREATE TABLE IF NOT EXISTS feedback (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO albums (title, artist, country, genre, year, status, rating, review, cover_url) VALUES
('AM', 'Arctic Monkeys', 'Великобритания', 'Rock', 2013, 'completed', 9.1,
 'Плотный ночной вайб, сильные гитарные хуки и очень цельный звук.',
 'https://upload.wikimedia.org/wikipedia/en/0/04/Arctic_Monkeys_-_AM.png'),
('Discovery', 'Daft Punk', 'Франция', 'Electronic', 2001, 'completed', 9.4,
 'Классика французской электроники, которую удобно слушать целиком.',
 'https://upload.wikimedia.org/wikipedia/en/a/ae/Daft_Punk_-_Discovery.jpg'),
('DAMN.', 'Kendrick Lamar', 'США', 'Hip-Hop', 2017, 'listening', 9.2,
 'Сильная лирика, продакшн и баланс между хитовостью и глубиной.',
 'https://upload.wikimedia.org/wikipedia/en/5/51/Kendrick_Lamar_-_Damn.png');
