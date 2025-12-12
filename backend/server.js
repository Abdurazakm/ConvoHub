require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mysql = require("mysql2/promise");

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
const socketToUser = {};
const userToSocket = {};
const rooms = ["general", "tech", "random"];

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

async function isUsernameTaken(username) {
  try {
    const [rows] = await db.execute("SELECT id FROM users WHERE username = ?", [
      username,
    ]);
    return rows.length > 0;
  } catch (err) {
    console.error("isUsernameTaken error", err.message);
    return false;
  }
}

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("join-server", async ({ username }) => {
    if (!username) {
      // Generate if not provided
      let attempts = 0;
      do {
        username = `User${Math.floor(Math.random() * 10000)}`;
        attempts++;
      } while ((await isUsernameTaken(username)) && attempts < 10);
    } else {
      // Use provided, but ensure unique
      if (await isUsernameTaken(username)) {
        let base = username;
        let counter = 1;
        while (await isUsernameTaken(`${base}${counter}`)) {
          counter++;
          if (counter > 10) break;
        }
        username = `${base}${counter}`;
      }
    }

    socketToUser[socket.id] = { username };
    userToSocket[username] = socket.id;

    try {
      await db.execute(
        "INSERT INTO users (username, socket_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE socket_id = ?",
        [username, socket.id, socket.id]
      );
    } catch (err) {
      console.error("save user", err.message);
    }

    socket.emit("rooms-list", rooms);
    io.emit(
      "online-users",
      Object.values(socketToUser).map((u) => u.username)
    );

    try {
      for (const r of rooms) {
        const [rows] = await db.execute(
          "SELECT sender AS username, message, created_at as time FROM public_messages WHERE room = ? ORDER BY id ASC LIMIT 100",
          [r]
        );
        socket.emit("room-messages", { room: r, messages: rows });
      }
    } catch (err) {
      console.error("load messages", err.message);
    }
  });

  socket.on("join-room", ({ room }) => {
    if (!room) return;
    socket.join(room);
  });

  socket.on("leave-room", ({ room }) => {
    if (!room) return;
    socket.leave(room);
  });

  socket.on("send-room-message", async ({ room, username, text }) => {
    if (!room || !username || !text) return;

    await savePublicMessage(room, username, text);

    io.to(room).emit("receive-room-message", {
      room,
      message: { username, message: text, time: new Date().toISOString() },
    });
  });

  socket.on(
    "send-private-message",
    async ({ toUsername, fromUsername, text }) => {
      if (!toUsername || !fromUsername || !text) return;

      await savePrivateMessage(fromUsername, toUsername, text);

      const toSocketId = userToSocket[toUsername];
      const msgObj = {
        from: fromUsername,
        to: toUsername,
        message: text,
        time: new Date().toISOString(),
      };

      const roomId = getPrivateRoomId(fromUsername, toUsername);

      if (toSocketId)
        io.to(toSocketId).emit("receive-private-message", {
          roomId,
          message: msgObj,
        });
      socket.emit("receive-private-message", { roomId, message: msgObj });
    }
  );

  function getPrivateRoomId(a, b) {
    return [a, b].sort().join("#");
  }

  socket.on("disconnect", async () => {
    const u = socketToUser[socket.id];
    if (u) {
      delete userToSocket[u.username];
      try {
        await db.execute(
          "UPDATE users SET socket_id = NULL WHERE username = ?",
          [u.username]
        );
      } catch (err) {}
    }
    delete socketToUser[socket.id];
    io.emit(
      "online-users",
      Object.values(socketToUser).map((u) => u.username)
    );
  });
});

// API endpoints
app.get("/api/rooms", (req, res) => res.json({ rooms }));
app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
