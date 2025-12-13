import React, { useState } from "react";

export default function MessageInput({ onSend }) {
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="p-4 bg-slate-900 border-t border-slate-700">
      <div className="flex gap-3 items-center">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="flex-1 p-3 rounded-full bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          onClick={submit}
          className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}
