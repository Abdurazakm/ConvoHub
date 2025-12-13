import React, { useState } from "react";

export default function PrivateChatModal({
  user,
  messages = [],
  onSend,
  onClose,
  currentUser,
}) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-96 h-[500px] bg-slate-900 rounded-xl flex flex-col text-white">

        {/* Header */}
        <div className="p-3 border-b border-slate-700 flex justify-between items-center">
          <span className="font-semibold">{user}</span>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            ✕
          </button>
        </div>

        {/* Messages (BOTTOM-UP) */}
        <div className="flex-1 p-3 overflow-y-auto overscroll-contain space-y-2 flex flex-col-reverse">
          {[...messages].reverse().map((m, i) => {
            const sender = m.from || m.username;
            const isMe = sender === currentUser;

            return (
              <div
                key={i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-xl max-w-xs text-sm break-words ${
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
            className="flex-1 p-2 rounded bg-slate-800 focus:outline-none"
            placeholder={`Message ${user}...`}
          />
          <button
            onClick={submit}
            className="px-4 bg-blue-600 rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
