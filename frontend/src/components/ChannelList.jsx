import React from "react";

export default function ChannelList({
  rooms = [],
  onRoomSelect,
  unreadRooms = {},
  currentRoom,
}) {
  return (
    <div className="space-y-1">
      {rooms.map((room) => {
        const unreadCount = unreadRooms[room] || 0;
        const isActive = room === currentRoom;

        return (
          <button
            key={room}
            onClick={() => onRoomSelect(room)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded
              ${isActive ? "bg-slate-700 font-semibold" : "hover:bg-slate-700"}
            `}
          >
            <span>#{room}</span>

            {unreadCount > 0 && !isActive && (
              <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
