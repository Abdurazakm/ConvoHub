import db from "../config/db.js";

const socketToUser = {};
const userToSocket = {};

export function addUser(socketId, username) {
  socketToUser[socketId] = username;
  userToSocket[username] = socketId;
}

export function removeUser(socketId) {
  const username = socketToUser[socketId];
  delete socketToUser[socketId];
  if (username) delete userToSocket[username];
}

export function getSocketByUsername(username) {
  return userToSocket[username];
}

export async function getAllUsersWithStatus() {
  const [rows] = await db.execute("SELECT username FROM users");

  return rows.map((u) => ({
    username: u.username,
    online: Boolean(userToSocket[u.username]),
  }));
}
