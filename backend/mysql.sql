-- Database
CREATE DATABASE IF NOT EXISTS convohub;
USE convohub;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  socket_id VARCHAR(255)
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Room members table
CREATE TABLE IF NOT EXISTS room_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(50),
  username VARCHAR(50)
);

-- Public messages table
CREATE TABLE IF NOT EXISTS public_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room VARCHAR(50),
  sender VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room messages table (for room-specific history)
CREATE TABLE IF NOT EXISTS room_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(50),
  sender VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Private messages table
CREATE TABLE IF NOT EXISTS private_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender VARCHAR(50),
  receiver VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (for authentication)
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  session_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for optimization
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_socket ON users(socket_id);

CREATE INDEX idx_public_room ON public_messages(room);
CREATE INDEX idx_public_sender ON public_messages(sender);
CREATE INDEX idx_public_created_at ON public_messages(created_at);

CREATE INDEX idx_room_msg_room ON room_messages(room_name);
CREATE INDEX idx_room_msg_sender ON room_messages(sender);
CREATE INDEX idx_room_msg_created_at ON room_messages(created_at);

CREATE INDEX idx_private_sender ON private_messages(sender);
CREATE INDEX idx_private_receiver ON private_messages(receiver);
CREATE INDEX idx_private_created_at ON private_messages(created_at);

CREATE INDEX idx_rooms_name ON rooms(name);

CREATE INDEX idx_room_members_room ON room_members(room_name);
CREATE INDEX idx_room_members_user ON room_members(username);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
