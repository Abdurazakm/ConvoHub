import React, { useEffect, useRef } from 'react';

export default function MessageList({ messages = [] }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={ref} className="p-4 overflow-auto h-full">
      {messages.map((m, i) => (
        <div key={i} className="mb-3">
          <div className="text-xs text-slate-400">{m.username || m.from} • {m.time ? new Date(m.time).toLocaleTimeString() : ''}</div>
          <div className="inline-block mt-1 px-3 py-2 rounded bg-slate-700">{m.message || m.text}</div>
        </div>
      ))}
    </div>
  );
}
