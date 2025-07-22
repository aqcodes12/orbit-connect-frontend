import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar({ username, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-800 text-white p-4 flex items-center justify-between">
      <div
        className="font-bold text-lg cursor-pointer"
        onClick={() => navigate("/")}
      >
        Orbit Connect
      </div>

      <div className="flex space-x-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "underline" : "hover:underline"
          }
        >
          Users
        </NavLink>

        <NavLink
          to="/groups"
          className={({ isActive }) =>
            isActive ? "underline" : "hover:underline"
          }
        >
          Groups
        </NavLink>

        <NavLink
          to="/groups/new"
          className={({ isActive }) =>
            isActive ? "underline" : "hover:underline"
          }
        >
          Create Group
        </NavLink>
        <NavLink
          to="/channels"
          className={({ isActive }) =>
            isActive ? "underline" : "hover:underline"
          }
        >
          Channels
        </NavLink>
        <NavLink
          to="/video/test-room"
          className={({ isActive }) =>
            isActive ? "underline" : "hover:underline"
          }
        >
          Video
        </NavLink>
      </div>

      <div className="flex items-center space-x-4">
        <div>Welcome, {username}</div>
        <button
          onClick={onLogout}
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
