import React, { useState, useEffect, useRef } from "react";

export default function PrivateChatModal({
  user,
  messages = [],
  onSend,
  onClose,
  currentUser,
}) {
  const [text, setText] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-96 bg-slate-900 rounded-xl flex flex-col text-white">

        {/* Header */}
        <div className="p-3 border-b border-slate-700 flex justify-between">
          <span className="font-semibold">{user}</span>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Messages */}
        <div ref={ref} className="flex-1 p-3 overflow-auto space-y-2">
          {messages.map((m, i) => {
            const sender = m.from || m.username;
            const isMe = sender === currentUser;

            return (
              <div
                key={i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-xl max-w-xs text-sm ${
                    isMe
                      ? "bg-blue-600 rounded-br-none"
                      : "bg-slate-700 rounded-bl-none"
                  }`}
                >
                  {m.message || m.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-700 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1 p-2 rounded bg-slate-800"
            placeholder={`Message ${user}...`}
          />
          <button onClick={submit} className="px-4 bg-blue-600 rounded">
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
