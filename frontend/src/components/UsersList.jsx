import React from 'react';

export default function UsersList({ users = [], onUserSelect }) {
  return (
    <div className="space-y-1">
      {users.map((u) => (
        <div key={u} className="flex items-center justify-between px-3 py-2 rounded hover:bg-slate-700">
          <div>{u}</div>
          <button onClick={() => onUserSelect(u)} className="text-sm text-blue-400 hover:underline">
            DM
          </button>
        </div>
      ))}
    </div>
  );
}
