import React from "react";
import { FaCommentDots } from "react-icons/fa";

export default function UsersList({
  users = [],
  onUserSelect,
  unreadPrivate = {},
  currentUser,
}) {
  const sortedUsers = [...users].sort((a, b) => b.online - a.online);

  return (
    <div className="space-y-1">
      {sortedUsers.map((u) => {
        const roomId = [currentUser, u.username].sort().join("#");
        const unreadCount = unreadPrivate[roomId] || 0;

        return (
          <div
            key={u.username}
            className="flex items-center justify-between px-3 py-2 rounded hover:bg-slate-700 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  u.online ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span
                className={`${
                  u.online ? "text-white font-medium" : "text-gray-400"
                }`}
              >
                {u.username}
              </span>
            </div>

            <button
              onClick={() => onUserSelect(u.username)}
              className="relative text-blue-400 hover:text-blue-300 p-1 rounded"
            >
              <FaCommentDots size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white px-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
