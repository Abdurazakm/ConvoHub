import { Server } from "socket.io";
import socketAuth from "./auth.middleware.js";
import roomEvents from "./rooms.js";
import privateEvents from "./private.js";
import userEvents from "./users.js";

export default function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: true },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.username);

    roomEvents(io, socket);
    privateEvents(io, socket);
    userEvents(io, socket); // ✅ ADD THIS
  });

  return io;
}
