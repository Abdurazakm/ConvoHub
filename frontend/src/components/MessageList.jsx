import React from "react";

export default function MessageList({ messages = [], currentUser }) {
  return (
    <div className="p-4 overflow-y-auto h-full space-y-2 flex flex-col-reverse overscroll-contain">
      {[...messages].reverse().map((m, i) => {
        const sender = m.username || m.from;
        const isMe = sender === currentUser;

        return (
          <div
            key={i}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-xl max-w-xs md:max-w-md text-sm ${
                isMe
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-slate-700 text-white rounded-bl-none"
              }`}
            >
              {!isMe && (
                <div className="text-xs text-slate-300 mb-1">
                  {sender}
                </div>
              )}
              <div>{m.message || m.text}</div>
              <div className="text-[10px] text-slate-300 mt-1 text-right">
                {m.time ? new Date(m.time).toLocaleTimeString() : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
