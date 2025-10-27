'use client'

import React from 'react'
import Link from 'next/link'
import { Bell, UserCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Topbar() {
  const pathname = usePathname();

  return (
    <header className="h-14 bg-[#3B1C3A] border-b border-[#5A314F] flex items-center px-6 justify-between sticky top-0 z-40">
      {/* Left: Logo & Page Title */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="AI Sales Agents Logo"
            className="w-9 h-9 object-contain"
            draggable={false}
          />
          <span className="font-bold text-base text-white tracking-tight">AI Sales Agents</span>
        </div>
        
        <span className="hidden md:inline-block h-6 border-l border-[#B04A8B] mx-4 opacity-50"></span>
        
        <span className="text-white font-medium text-lg capitalize tracking-wide hidden md:inline-block">
          {getTitleFromPath(pathname)}
        </span>
      </div>
      {/* Right: Icons/Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Button */}
        <button className="relative text-[#FFB051] hover:text-white rounded-full p-2 transition group">
          <Bell size={20} />
          <span className="absolute top-[9px] right-[9px] w-2 h-2 bg-[#FFB051] rounded-full border-2 border-[#3B1C3A]"></span>
        </button>
        {/* User Avatar/Settings */}
        <div className="relative ml-2">
          <button
            className="text-[#EED7FF] hover:text-white flex items-center transition focus:outline-none"
            onClick={() => {
              const dropdown = document.getElementById('user-menu-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
            aria-label="Open user menu"
            type="button"
          >
            <UserCircle size={26} />
          </button>
          <div
            id="user-menu-dropdown"
            className="hidden absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 min-w-max"
          >
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              onClick={() => {
                const dropdown = document.getElementById('user-menu-dropdown');
                dropdown?.classList.add('hidden');
              }}
            >
              Profile
            </Link>
            <button
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              onClick={() => {
                // replace this with your logout logic
                alert('Logging out...');
                const dropdown = document.getElementById('user-menu-dropdown');
                dropdown?.classList.add('hidden');
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Returns a formatted page title from the route path
function getTitleFromPath(path: string) {
  if (!path || path === '/') return 'Home';
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    clients: 'Clients',
    leads: 'Leads',
    messages: 'Messages',
    campaigns: 'Campaigns',
    calendar: 'Calendar',
    settings: 'Settings'
  };
  const first = path.split('/').filter(Boolean)[0];
  return map[first] || first.charAt(0).toUpperCase() + first.slice(1);
}

