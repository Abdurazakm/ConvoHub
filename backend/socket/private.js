import db from "../config/db.js";
import { savePrivateMessage } from "../services/message.service.js";
import {
  addUser,
  removeUser,
  getSocketByUsername,
} from "../services/user.service.js";

function getPrivateRoomId(a, b) {
  return [a, b].sort().join("#");
}

export default function privateEvents(io, socket) {
  // Register user as online
  addUser(socket.id, socket.username);

  // Load private messages
  socket.on("load-private-messages", async ({ toUsername }) => {
    if (!toUsername) return;

    const roomId = getPrivateRoomId(socket.username, toUsername);

    const [rows] = await db.execute(
      `SELECT sender AS \`from\`, receiver AS \`to\`, message, created_at AS time
       FROM private_messages
       WHERE (sender = ? AND receiver = ?)
          OR (sender = ? AND receiver = ?)
       ORDER BY created_at ASC`,
      [socket.username, toUsername, toUsername, socket.username]
    );

    socket.emit("private-messages-loaded", {
      roomId,
      messages: rows,
    });
  });

  // Send private message
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

    // Send to receiver if online
    const targetSocket = getSocketByUsername(toUsername);
    if (targetSocket) {
      io.to(targetSocket).emit("receive-private-message", {
        roomId,
        message: msg,
      });
    }

    // Echo back to sender
    socket.emit("receive-private-message", {
      roomId,
      message: msg,
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Private disconnect:", socket.username);
    removeUser(socket.id);
  });
}
