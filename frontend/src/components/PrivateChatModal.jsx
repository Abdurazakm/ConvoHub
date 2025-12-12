import React, { useState } from 'react';

export default function PrivateChatModal({ user, messages = [], onSend, onClose }) {
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="w-96 bg-slate-800 rounded p-4 text-white">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Private: {user}</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-white">Close</button>
        </div>

        <div className="h-64 overflow-auto bg-slate-900 p-3 rounded mb-3">
          {messages.map((m, i) => (
            <div key={i} className="mb-2">
              <strong>{m.from || m.username}: </strong>
              <span>{m.message || m.text}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="flex-1 p-2 rounded bg-slate-700"
            placeholder={`Message ${user}...`}
          />
          <button onClick={submit} className="px-4 py-2 bg-blue-600 rounded">Send</button>
        </div>
      </div>
    </div>
  );
}
