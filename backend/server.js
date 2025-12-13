// server.js
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
    console.log("Connected to MySQL");
  } catch (err) {
    console.error("MySQL connection error:", err.message);
  }
})();

// ---------- In-memory maps ----------
const socketToUser = {}; // socketId -> { id, username }
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
    console.error("savePublicMessage error", err.message);
  }
}

async function savePrivateMessage(sender, receiver, message) {
  try {
    await db.execute(
      "INSERT INTO private_messages (sender, receiver, message) VALUES (?, ?, ?)",
      [sender, receiver, message]
    );
  } catch (err) {
    console.error("savePrivateMessage error", err.message);
  }
}

function getPrivateRoomId(a, b) {
  return [a, b].sort().join("#");
}

// ---------- Authentication routes ----------

// Register user
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  try {
    const [rows] = await db.execute(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    if (rows.length > 0)
      return res.status(400).json({ error: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);
    res.json({ ok: true, message: "User registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Login user
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  try {
    const [rows] = await db.execute(
      "SELECT id, password FROM users WHERE username = ?",
      [username]
    );
    if (rows.length === 0)
      return res.status(400).json({ error: "Invalid username or password" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid username or password" });

    const token = uuidv4();
    await db.execute(
      "INSERT INTO sessions (user_id, session_token) VALUES (?, ?)",
      [user.id, token]
    );

    res.json({ ok: true, token, username });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Verify session token middleware
async function verifyToken(token) {
  try {
    const [rows] = await db.execute(
      "SELECT u.username FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = ?",
      [token]
    );
    if (rows.length === 0) return null;
    return rows[0].username;
  } catch (err) {
    console.error(err.message);
    return null;
  }
}

// ---------- Socket.IO ----------
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication required"));
  const username = await verifyToken(token);
  if (!username) return next(new Error("Invalid token"));

  socket.username = username;
  socketToUser[socket.id] = { username };
  userToSocket[username] = socket.id;
  next();
});

io.on("connection", async (socket) => {
  console.log("User connected:", socket.username);

  // send rooms list
  socket.emit("rooms-list", rooms);

  // send online users
  io.emit(
    "online-users",
    Object.values(socketToUser).map((u) => u.username)
  );

  // load last 100 messages per room
  for (const r of rooms) {
    const [rows] = await db.execute(
      "SELECT sender AS username, message, created_at as time FROM public_messages WHERE room = ? ORDER BY id ASC LIMIT 100",
      [r]
    );
    socket.emit("room-messages", { room: r, messages: rows });
  }

  // join room
  socket.on("join-room", ({ room }) => {
    if (!room) return;
    socket.join(room);
  });

  // leave room
  socket.on("leave-room", ({ room }) => {
    if (!room) return;
    socket.leave(room);
  });

  // public message
  socket.on("send-room-message", async ({ room, text }) => {
    if (!room || !text) return;
    await savePublicMessage(room, socket.username, text);

    io.to(room).emit("receive-room-message", {
      room,
      message: { username: socket.username, message: text, time: new Date().toISOString() },
    });
  });

  // private message
  socket.on("send-private-message", async ({ toUsername, text }) => {
    if (!toUsername || !text) return;
    await savePrivateMessage(socket.username, toUsername, text);

    const msgObj = {
      from: socket.username,
      to: toUsername,
      message: text,
      time: new Date().toISOString(),
    };
    const roomId = getPrivateRoomId(socket.username, toUsername);

    const toSocketId = userToSocket[toUsername];
    if (toSocketId) io.to(toSocketId).emit("receive-private-message", { roomId, message: msgObj });

    socket.emit("receive-private-message", { roomId, message: msgObj });
  });

  // load private messages
  socket.on("load-private-messages", async ({ toUsername }) => {
    if (!toUsername) return;
    const roomId = getPrivateRoomId(socket.username, toUsername);
    try {
      const [rows] = await db.execute(
        "SELECT sender AS from, receiver AS to, message, created_at AS time FROM private_messages WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?) ORDER BY created_at ASC LIMIT 100",
        [socket.username, toUsername, toUsername, socket.username]
      );
      socket.emit("private-messages-loaded", { roomId, messages: rows });
    } catch (err) {
      console.error("loadPrivateMessages error", err.message);
    }
  });

  // typing indicator
  socket.on("typing", ({ room, isPrivate, privateRoomId }) => {
    if (isPrivate && privateRoomId) {
      socket.to(privateRoomId).emit("typing", { privateRoomId, username: socket.username });
    } else if (room) {
      socket.to(room).emit("typing", { room, username: socket.username });
    }
  });

  // disconnect
  socket.on("disconnect", async () => {
    delete userToSocket[socket.username];
    delete socketToUser[socket.id];

    io.emit(
      "online-users",
      Object.values(socketToUser).map((u) => u.username)
    );
  });
});

// ---------- API health ----------
app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`ConvoHub Backend running on port ${PORT}`));
// ---------- Start server ----------
