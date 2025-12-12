import React from 'react';
import ChannelList from './ChannelList';
import UsersList from './UsersList';

export default function Sidebar({ rooms, users, onRoomSelect, onUserSelect }) {
  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Channels</h2>
      </div>

      <div className="flex-1 overflow-auto">
        <ChannelList rooms={rooms} onRoomSelect={onRoomSelect} />
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Online</h3>
          <UsersList users={users} onUserSelect={onUserSelect} />
        </div>
      </div>
    </aside>
  );
}
