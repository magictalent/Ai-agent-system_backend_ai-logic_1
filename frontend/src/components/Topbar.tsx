'use client'

import React from 'react'
import Link from 'next/link'
import { Bell, UserCircle, Menu, Search, Plus, HelpCircle, Settings, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Topbar() {
  const pathname = usePathname();

  return (
    <header className="h-14 bg-gradient-to-r from-[#3B0F2A] to-[#4C1C3F] border-b border-[#5A314F] flex items-center px-2 md:px-4 justify-between sticky top-0 z-40">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 md:gap-4 min-w-[160px]">
        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Open menu"
          className="md:hidden p-2 rounded hover:bg-white/10 text-white"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('toggle-sidebar'))
            }
          }}
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <img
            src="/logo23.png"
            alt="AI Sales Agents Logo"
            className="w-30 h-30 object-contain"
            draggable={false}
          />
        </div>
      </div>
      {/* Center: Search */}
      <div className="flex-1 px-2 md:px-6">
        <div className="max-w-2xl mx-auto w-full hidden sm:flex items-center bg-white/10 hover:bg-white/15 border border-white/20 rounded-full h-9 px-3 text-white transition">
          <Search size={16} className="opacity-80" />
          <input
            className="bg-transparent px-2 flex-1 outline-none placeholder-white/70 text-sm"
            placeholder="Search"
          />
          <button className="ml-2 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition" aria-label="Create">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 md:gap-2">
        <button className="hidden md:inline px-3 py-1.5 text-sm rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20">Upgrade</button>
        <button className="p-2 text-white/90 hover:bg-white/10 rounded" aria-label="Help"><HelpCircle size={18} /></button>
        <button className="p-2 text-white/90 hover:bg-white/10 rounded" aria-label="Settings"><Settings size={18} /></button>
        <button className="relative p-2 text-[#FFB051] hover:bg-white/10 rounded" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-[6px] right-[6px] w-2 h-2 bg-[#FFB051] rounded-full border-2 border-[#4C1C3F]"></span>
        </button>
        <button className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full bg-[#FFDDB0] text-[#5A314F] hover:brightness-95">
          <Sparkles size={16} /> Assistant
        </button>
        {/* User menu */}
        <div className="relative ml-1">
          <button
            className="text-[#EED7FF] hover:text-white flex items-center transition focus:outline-none p-1.5"
            onClick={() => {
              const dropdown = document.getElementById('user-menu-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
            aria-label="Open user menu"
            type="button"
          >
            <UserCircle size={24} />
          </button>
          <div
            id="user-menu-dropdown"
            className="hidden absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg ring-1 ring-black/5 z-50"
          >
            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
            <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</Link>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => alert('Logging out...')}>Logout</button>
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

