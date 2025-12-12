import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import PrivateChatModal from "../components/PrivateChatModal";

const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export default function Chat() {
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("general");
  const [roomMessages, setRoomMessages] = useState({}); // { room: [messages] }
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [privateChats, setPrivateChats] = useState({}); // { roomId: [messages] }
  const [privateTarget, setPrivateTarget] = useState(null); // username for modal
  const [username, setUsername] = useState(location.state?.username || null);

  useEffect(() => {
    const s = io(SERVER);
    setSocket(s);

    s.on("connect", () => {
      s.emit("join-server", { username });
    });

    s.on("rooms-list", (rs) => setRooms(rs || []));
    s.on("room-messages", ({ room, messages }) => {
      setRoomMessages((p) => ({ ...p, [room]: messages }));
    });
    s.on("receive-room-message", ({ room, message }) => {
      setRoomMessages((p) => ({ ...p, [room]: [...(p[room] || []), message] }));
    });

    s.on("online-users", (list) => setOnlineUsers(list || []));

    s.on("receive-private-message", ({ roomId, message }) => {
      setPrivateChats((p) => ({
        ...p,
        [roomId]: [...(p[roomId] || []), message],
      }));
    });

    return () => {
      s.disconnect();
    };
  }, [username]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join-room", { room: currentRoom });
  }, [currentRoom, socket]);

  const sendRoomMessage = (text) => {
    if (!socket || !username) return;
    socket.emit("send-room-message", { room: currentRoom, username, text });
  };

  const startPrivateChat = (targetUsername) => {
    // open modal and send first message or wait
    setPrivateTarget(targetUsername);
  };

  const sendPrivateMessage = (toUsername, text) => {
    if (!socket) return;
    socket.emit("send-private-message", {
      toUsername,
      fromUsername: username,
      text,
    });
  };

  return (
    <div className="h-screen flex">
      <Sidebar
        rooms={rooms}
        users={onlineUsers}
        onRoomSelect={(r) => setCurrentRoom(r)}
        onUserSelect={(u) => startPrivateChat(u)}
      />

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-slate-900 text-white">
          <div className="text-lg font-semibold">#{currentRoom}</div>
          <div className="text-sm text-slate-400">
            You: {username || "Connecting..."}
          </div>
        </div>

        <div className="flex-1 bg-slate-800 text-white overflow-hidden">
          <MessageList messages={roomMessages[currentRoom] || []} />
        </div>

        <MessageInput onSend={sendRoomMessage} />
      </div>

      {privateTarget && (
        <PrivateChatModal
          user={privateTarget}
          messages={
            privateChats[[privateTarget, username].sort().join("#")] || []
          }
          onClose={() => setPrivateTarget(null)}
          onSend={(text) => {
            sendPrivateMessage(privateTarget, text);
          }}
        />
      )}
    </div>
  );
}
