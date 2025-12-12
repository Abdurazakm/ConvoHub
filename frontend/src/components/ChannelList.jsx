import React from 'react';

export default function ChannelList({ rooms = [], onRoomSelect }) {
  return (
    <div className="space-y-1">
      {rooms.map((r) => (
        <button
          key={r}
          onClick={() => onRoomSelect(r)}
          className="w-full text-left px-3 py-2 rounded hover:bg-slate-700"
        >
          #{r}
        </button>
      ))}
    </div>
  );
}
