import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import PrivateChatModal from "../components/PrivateChatModal";

const SERVER = "http://localhost:4000";

export default function Chat() {
  const navigate = useNavigate();

  // 🔐 persistent auth
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("General");
  const [roomMessages, setRoomMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [privateChats, setPrivateChats] = useState({});
  const [privateTarget, setPrivateTarget] = useState(null);

  // 🚫 protect route
  useEffect(() => {
    if (!token || !username) navigate("/");
  }, [token, username, navigate]);

  // 🔌 socket connection
  useEffect(() => {
    if (!token || !username) return;

    const s = io(SERVER, { auth: { token } });
    setSocket(s);

    s.on("rooms-list", (rs) => setRooms(rs || []));

    s.on("room-messages", ({ room, messages }) => {
      setRoomMessages((prev) => ({ ...prev, [room]: messages }));
    });

    s.on("receive-room-message", ({ room, message }) => {
      setRoomMessages((prev) => ({
        ...prev,
        [room]: [...(prev[room] || []), message],
      }));
    });

    s.on("online-users", (list) => setOnlineUsers(list || []));

    s.on("receive-private-message", ({ roomId, message }) => {
      setPrivateChats((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), message],
      }));
    });

    s.on("private-messages-loaded", ({ roomId, messages }) => {
      setPrivateChats((prev) => ({
        ...prev,
        [roomId]: messages,
      }));
    });

    return () => s.disconnect();
  }, [token, username]);

  // 🚪 join / leave room
  useEffect(() => {
    if (!socket || !currentRoom) return;
    socket.emit("join-room", { room: currentRoom });
    return () => socket.emit("leave-room", { room: currentRoom });
  }, [currentRoom, socket]);

  // 📤 send room message
  const sendRoomMessage = (text) => {
    if (!socket || !text) return;
    socket.emit("send-room-message", { room: currentRoom, text });
  };

  // 🔒 private chat
  const startPrivateChat = (target) => {
    if (!target || target === username) return;
    setPrivateTarget(target);
    socket.emit("load-private-messages", { toUsername: target });
  };

  const sendPrivateMessage = (toUsername, text) => {
    if (!socket || !text) return;
    socket.emit("send-private-message", { toUsername, text });
  };

  const privateRoomId =
    privateTarget && [username, privateTarget].sort().join("#");

  return (
    <div className="h-screen flex bg-gray-900 text-white">
      <Sidebar
        rooms={rooms}
        users={onlineUsers.filter((u) => u !== username)}
        onRoomSelect={setCurrentRoom}
        onUserSelect={startPrivateChat}
        currentRoom={currentRoom}
      />

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-slate-900">
          <div className="text-lg font-semibold">#{currentRoom}</div>
          <div className="text-sm text-slate-400">You: {username}</div>
        </div>

        <div className="flex-1 bg-slate-800 overflow-hidden">
          {/* ✅ UPDATED */}
          <MessageList
            messages={roomMessages[currentRoom] || []}
            currentUser={username}
          />
        </div>

        <MessageInput onSend={sendRoomMessage} />
      </div>

      {privateTarget && (
        <PrivateChatModal
          user={privateTarget}
          messages={privateChats[privateRoomId] || []}
          currentUser={username}   // ✅ UPDATED
          onClose={() => setPrivateTarget(null)}
          onSend={(text) => sendPrivateMessage(privateTarget, text)}
        />
      )}
    </div>
  );
}
