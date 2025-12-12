import React, { useState } from 'react';

export default function MessageInput({ onSend }) {
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div className="p-4 bg-slate-900">
      <div className="flex gap-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="flex-1 p-3 rounded bg-slate-800 text-white"
          placeholder="Type a message..."
        />
        <button onClick={submit} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700">
          Send
        </button>
      </div>
    </div>
  );
}
