import React from "react";
import { FaCommentDots } from "react-icons/fa"; // ✅ import icon

export default function UsersList({ users = [], onUserSelect }) {
  // sort online first
  const sortedUsers = [...users].sort((a, b) => b.online - a.online);

  return (
    <div className="space-y-1">
      {sortedUsers.map((u) => (
        <div
          key={u.username}
          className="flex items-center justify-between px-3 py-2 rounded hover:bg-slate-700 cursor-pointer"
        >
          {/* Left: status dot + username */}
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

          {/* Right: chat icon */}
          <button
            onClick={() => onUserSelect(u.username)}
            className="text-blue-400 hover:text-blue-300 p-1 rounded"
          >
            <FaCommentDots size={16} /> {/* ✅ icon instead of "DM" */}
          </button>
        </div>
      ))}
    </div>
  );
}
