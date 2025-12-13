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
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("General");
  const [roomMessages, setRoomMessages] = useState({});
  const [users, setUsers] = useState([]);
  const [privateChats, setPrivateChats] = useState({});
  const [privateTarget, setPrivateTarget] = useState(null);

  // Protect route
  useEffect(() => {
    if (!token || !username) navigate("/");
  }, [token, username, navigate]);

  // Socket connection
  useEffect(() => {
    if (!token || !username) return;

    const s = io(SERVER, { auth: { token } });
    setSocket(s);

    // Rooms
    s.on("rooms-list", (rs) => setRooms(rs || []));

    // Users list
    s.on("users-list", (list) => {
      if (Array.isArray(list)) {
        setUsers(list.filter((u) => u.username !== username));
      }
    });

    // Room messages
    s.on("room-messages", ({ room, messages }) => {
      setRoomMessages((prev) => ({ ...prev, [room]: messages }));
    });

    // New room message
    s.on("receive-room-message", ({ room, message }) => {
      setRoomMessages((prev) => ({
        ...prev,
        [room]: [...(prev[room] || []), message],
      }));
    });

    // Private messages received
    s.on("receive-private-message", ({ roomId, message }) => {
      setPrivateChats((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), message],
      }));
    });

    // Private messages loaded
    s.on("private-messages-loaded", ({ roomId, messages }) => {
      setPrivateChats((prev) => ({
        ...prev,
        [roomId]: messages,
      }));
    });

    // Restore previous private chats
    // const savedChats = JSON.parse(localStorage.getItem("privateChats") || "[]");
    // savedChats.forEach((roomId) => {
    //   const otherUser = roomId.split("#").find((u) => u !== username);
    //   if (otherUser) startPrivateChat(otherUser, s);
    // });

    return () => s.disconnect();
  }, [token, username]);

  // Join/leave room + load messages
  useEffect(() => {
    if (!socket || !currentRoom) return;

    socket.emit("join-room", { room: currentRoom });
    socket.emit("get-room-messages", { room: currentRoom });

    return () => socket.emit("leave-room", { room: currentRoom });
  }, [currentRoom, socket]);

  // Send room message
  const sendRoomMessage = (text) => {
    if (!socket || !text.trim()) return;
    socket.emit("send-room-message", { room: currentRoom, text });
  };

  // Start private chat
  const startPrivateChat = (target, s = socket) => {
    if (!target || target === username || !s) return;
    setPrivateTarget(target);

    const roomId = [username, target].sort().join("#");

    // Save active chats in localStorage
    const saved = JSON.parse(localStorage.getItem("privateChats") || "[]");
    if (!saved.includes(roomId)) {
      saved.push(roomId);
      localStorage.setItem("privateChats", JSON.stringify(saved));
    }

    s.emit("load-private-messages", { toUsername: target });
  };

  // Send private message
  const sendPrivateMessage = (toUsername, text) => {
    if (!socket || !text.trim()) return;
    socket.emit("send-private-message", { toUsername, text });
  };

  const privateRoomId = privateTarget && [username, privateTarget].sort().join("#");

  return (
    <div className="h-screen flex bg-gray-900 text-white overflow-hidden">
      <Sidebar
        rooms={rooms}
        users={users}
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
          currentUser={username}
          onClose={() => setPrivateTarget(null)}
          onSend={(text) => sendPrivateMessage(privateTarget, text)}
        />
      )}
    </div>
  );
}
