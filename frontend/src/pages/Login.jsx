import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handle = () => {
    if (!username.trim()) return;
    navigate("/chat", { state: { username: username.trim() } });
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-96 p-8 rounded-lg bg-slate-800 text-white shadow-lg">
        <h1 className="text-2xl mb-4 font-semibold">Join Chat</h1>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name"
          className="w-full p-3 mb-4 rounded bg-slate-700 placeholder-slate-300"
        />
        <button
          onClick={handle}
          className="w-full p-3 rounded bg-blue-600 hover:bg-blue-700"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
