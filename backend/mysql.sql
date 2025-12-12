-- mysql.sql
-- Run this in your MySQL server (e.g. via MySQL Workbench or `mysql` CLI).

CREATE DATABASE IF NOT EXISTS slack_chat;
USE slack_chat;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  socket_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Public messages table
CREATE TABLE IF NOT EXISTS public_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room VARCHAR(100) NOT NULL,
  sender VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Private messages table
CREATE TABLE IF NOT EXISTS private_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender VARCHAR(100) NOT NULL,
  receiver VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Insert default chat rooms
INSERT IGNORE INTO chat_rooms (room_name) VALUES ('General'), ('Technology'), ('Random');
-- End of mysql.sql
