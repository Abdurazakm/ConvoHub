import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, methods: ["GET", "POST"] },
});

// ---------- MySQL setup ----------
const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

let db;
(async function initDb() {
  try {
    db = await mysql.createPool(DB_CONFIG);
    await db.query("SELECT 1");
    console.log("✅ Connected to MySQL");
  } catch (err) {
    console.error("❌ MySQL connection error:", err.message);
    process.exit(1);
  }
})();

// ---------- In-memory maps ----------
const socketToUser = {}; // socketId -> username
const userToSocket = {}; // username -> socketId
const rooms = ["General", "Tech Talk", "Random"];

// ---------- Helper functions ----------
async function savePublicMessage(room, sender, message) {
  try {
    await db.execute(
      "INSERT INTO public_messages (room, sender, message) VALUES (?, ?, ?)",
      [room, sender, message]
    );
  } catch (err) {
    console.error("savePublicMessage error:", err.message);
  }
}

async function savePrivateMessage(sender, receiver, message) {
  try {
    await db.execute(
      "INSERT INTO private_messages (sender, receiver, message) VALUES (?, ?, ?)",
      [sender, receiver, message]
    );
  } catch (err) {
    console.error("savePrivateMessage error:", err.message);
  }
}

function getPrivateRoomId(a, b) {
  return [a, b].sort().join("#");
}

async function getAllUsersWithStatus() {
  if (!db) return [];
  const [rows] = await db.execute("SELECT username FROM users");
  return rows.map((u) => ({
    username: u.username,
    online: Boolean(userToSocket[u.username]),
  }));
}

// ---------- Authentication ----------
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  try {
    const [rows] = await db.execute("SELECT id FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length)
      return res.status(400).json({ error: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await db.execute("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashed,
    ]);

    res.json({ ok: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  try {
    const [rows] = await db.execute(
      "SELECT id, password FROM users WHERE username = ?",
      [username]
    );

    if (!rows.length)
      return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = uuidv4();
    await db.execute(
      "INSERT INTO sessions (user_id, session_token) VALUES (?, ?)",
      [rows[0].id, token]
    );

    res.json({ ok: true, token, username });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

async function verifyToken(token) {
  const [rows] = await db.execute(
    `SELECT u.username
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.session_token = ?`,
    [token]
  );
  return rows.length ? rows[0].username : null;
}

// ---------- Socket.IO ----------
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    const username = await verifyToken(token);
    if (!username) return next(new Error("Invalid token"));

    socket.username = username;
    socketToUser[socket.id] = username;
    userToSocket[username] = socket.id;

    next();
  } catch (err) {
    next(new Error("Auth failed"));
  }
});

io.on("connection", async (socket) => {
  console.log("🟢 Connected:", socket.username);

  // Rooms
  socket.emit("rooms-list", rooms);

  // Users
  io.emit("users-list", await getAllUsersWithStatus());

  // Load room messages
  for (const room of rooms) {
    const [rows] = await db.execute(
      `SELECT sender AS username, message, created_at AS time
       FROM public_messages
       WHERE room = ?
       ORDER BY id ASC
       LIMIT 100`,
      [room]
    );
    socket.emit("room-messages", { room, messages: rows });
  }

  // ---------- Join / Leave ----------
  socket.on("join-room", ({ room }) => room && socket.join(room));
  socket.on("leave-room", ({ room }) => room && socket.leave(room));
  // Load messages for a specific room on demand
  socket.on("get-room-messages", async ({ room }) => {
    if (!room) return;

    try {
      const [rows] = await db.execute(
        `SELECT sender AS username, message, created_at AS time
       FROM public_messages
       WHERE room = ?
       ORDER BY id ASC
       LIMIT 100`,
        [room]
      );

      socket.emit("room-messages", { room, messages: rows });
    } catch (err) {
      console.error("get-room-messages error:", err.message);
    }
  });

  // ---------- Public Messages ----------
  socket.on("send-room-message", async ({ room, text }) => {
    if (!room || !text) return;

    await savePublicMessage(room, socket.username, text);

    io.to(room).emit("receive-room-message", {
      room,
      message: {
        username: socket.username,
        message: text,
        time: new Date().toISOString(),
      },
    });
  });

  // ---------- Private Messages ----------
  socket.on("send-private-message", async ({ toUsername, text }) => {
    if (!toUsername || !text) return;

    await savePrivateMessage(socket.username, toUsername, text);

    const roomId = getPrivateRoomId(socket.username, toUsername);
    const msg = {
      from: socket.username,
      to: toUsername,
      message: text,
      time: new Date().toISOString(),
    };

    const toSocket = userToSocket[toUsername];
    if (toSocket)
      io.to(toSocket).emit("receive-private-message", { roomId, message: msg });

    socket.emit("receive-private-message", { roomId, message: msg });
  });

  // ---------- Load Private Messages History ----------
  socket.on("load-private-messages", async ({ toUsername }) => {
    if (!toUsername) return;

    const roomId = getPrivateRoomId(socket.username, toUsername);

    const [rows] = await db.execute(
      `SELECT sender AS \`from\`, receiver AS \`to\`, message, created_at AS time
       FROM private_messages
       WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)
       ORDER BY created_at ASC`,
      [socket.username, toUsername, toUsername, socket.username]
    );

    socket.emit("private-messages-loaded", { roomId, messages: rows });
  });

  // ---------- Disconnect ----------
  socket.on("disconnect", async () => {
    console.log("🔴 Disconnected:", socket.username);

    delete userToSocket[socket.username];
    delete socketToUser[socket.id];

    io.emit("users-list", await getAllUsersWithStatus());
  });
});

// Health check
app.get("/api/health", (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`🚀 ConvoHub Backend running on port ${PORT}`)
);
