import mysql from "mysql2/promise";

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const onlineUsers = new Map();

export default async function userEvents(io, socket) {
  onlineUsers.set(socket.username, socket.id);

  async function emitUsers() {
    const [rows] = await db.execute(
      "SELECT username FROM users"
    );

    const users = rows.map((u) => ({
      username: u.username,
      online: onlineUsers.has(u.username),
    }));

    io.emit("users-list", users);
  }

  await emitUsers();

  socket.on("disconnect", async () => {
    onlineUsers.delete(socket.username);
    await emitUsers();
  });
}
