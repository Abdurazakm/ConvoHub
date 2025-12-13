import db from "../config/db.js";

export default async function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));

  const [rows] = await db.execute(`
    SELECT u.username
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ?
  `, [token]);

  if (!rows.length) return next(new Error("Invalid token"));

  socket.username = rows[0].username;
  next();
}
