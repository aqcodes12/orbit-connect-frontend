// NavV2.jsx
import React, { use, useState } from "react";
import { Link } from "react-router-dom";
import OrbLogo from "../assets/orb.png";
import userIcon from "../assets/user.png";

// Config
const NAV_ITEMS = [
  { label: "Users", to: "/", active: true },
  { label: "Groups", to: "/groups" },
  { label: "Create Group", to: "/groups/new" },
  { label: "Channels", to: "/channels" },
  //   { label: "Video", to: "/video/test-room" },
  { label: "Meetings", to: "/meet" },
];

const USER_MENU_ITEMS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Settings", to: "/settings" },
  { label: "Earnings", to: "/earnings" },
  { label: "Sign out", to: "/logout" },
];

const NavItem = ({ label, to, active }) => (
  <li>
    <Link
      to={to}
      className={`block py-2 px-3 rounded md:p-0 ${
        active
          ? "text-white bg-blue-700 md:text-blue-700 md:bg-transparent"
          : "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700"
      }`}
    >
      {label}
    </Link>
  </li>
);

const UserDropdown = ({ username, isOpen, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div className="z-50 absolute top-12 right-0 text-base list-none bg-slate-200 divide-y divide-gray-100 rounded-lg shadow-sm">
      <div className="px-4 py-3">
        <span className="block text-sm text-gray-900">{username}</span>
        <span className="block text-sm text-gray-500 truncate">
          name@flowbite.com
        </span>
      </div>
      <ul className="py-2">
        {USER_MENU_ITEMS.map((item) => (
          <li key={item.label}>
            {item.label === "Sign out" ? (
              <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {item.label}
              </button>
            ) : (
              <Link
                to={item.to}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const NavV2 = ({ username, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <nav className="bg-white border-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link
          to="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img src={OrbLogo} className="h-8" alt="Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap">
            Orbit Connect
          </span>
        </Link>

        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            type="button"
            className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
            aria-expanded={isUserDropdownOpen}
          >
            <span className="sr-only">Open user menu</span>
            <img className="w-8 h-8 rounded-full" src={userIcon} alt="User" />
          </button>

          <UserDropdown
            username={username}
            isOpen={isUserDropdownOpen}
            onLogout={onLogout}
          />

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:ring-2 focus:ring-gray-200"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">Toggle menu</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div
          className={`w-full md:flex md:w-auto md:order-1 ${
            isMobileMenuOpen ? "" : "hidden"
          }`}
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.label}
                label={item.label}
                to={item.to}
                active={item.active}
              />
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavV2;
