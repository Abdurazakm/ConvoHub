import db from "../config/db.js";
import { savePublicMessage } from "../services/message.service.js";

const ROOMS = ["General", "Tech Talk", "Random"];

export default async function roomEvents(io, socket) {
  console.log("🟢 Room socket:", socket.username);

  // Send available rooms
  socket.emit("rooms-list", ROOMS);

  // Load messages for all rooms on connect
  for (const room of ROOMS) {
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

  // Join room
  socket.on("join-room", ({ room }) => {
    if (!room) return;
    socket.join(room);
  });

  // Leave room
  socket.on("leave-room", ({ room }) => {
    if (!room) return;
    socket.leave(room);
  });

  // Load messages for ONE room (on channel switch)
  socket.on("get-room-messages", async ({ room }) => {
    if (!room) return;

    const [rows] = await db.execute(
      `SELECT sender AS username, message, created_at AS time
       FROM public_messages
       WHERE room = ?
       ORDER BY id ASC
       LIMIT 100`,
      [room]
    );

    socket.emit("room-messages", { room, messages: rows });
  });

  // Send message to room
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
}
