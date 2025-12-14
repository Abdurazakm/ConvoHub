import React, { useState } from "react";
import ChannelList from "./ChannelList";
import UsersList from "./UsersList";
import { Menu, X } from "lucide-react";

export default function Sidebar({
  rooms,
  users,
  currentRoom,
  onRoomSelect,
  onUserSelect,
  unreadRooms,
  unreadPrivate,
  currentUser,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 py-3">
        <button onClick={() => setOpen(true)}>
          <Menu size={24} />
        </button>
        <span className="font-semibold">ConvoHub</span>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-72 bg-slate-900 text-white flex flex-col p-4 transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Close button */}
        <div className="md:hidden flex justify-end mb-3">
          <button onClick={() => setOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-bold">Channels</h2>
        </div>

        <div className="flex-1 overflow-auto">
          <ChannelList
            rooms={rooms}
            currentRoom={currentRoom}
            unreadRooms={unreadRooms}
            onRoomSelect={(room) => {
              onRoomSelect(room);
              setOpen(false); // mobile close
            }}
          />

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Users</h3>
            <UsersList
              users={users}
              currentUser={currentUser}
              unreadPrivate={unreadPrivate}
              onUserSelect={(user) => {
                onUserSelect(user);
                setOpen(false);
              }}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
