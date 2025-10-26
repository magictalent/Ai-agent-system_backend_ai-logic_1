'use client'

import {
  LayoutDashboard,
  Users,
  Megaphone,
  Calendar,
  Settings,
  Plus,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Clients', href: '/clients' },
  { icon: Users, label: 'Leads', href: '/leads' },
  { icon: MessageCircle, label: 'Messages', href: '/messages' },
  { icon: Megaphone, label: 'Campaigns', href: '/campaigns' },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="bg-[#3B1C3A] min-h-screen w-[260px] flex flex-col border-r-0 shadow-lg relative z-30">
      {/* Sidebar top: logo and trial notice */}
      <div className="px-5 pt-6 pb-5 border-b border-[#5A314F]">
        <div className="flex items-center gap-2 mb-5">
          <img
            src="/logo.png"
            alt="AI Sales Agents Logo"
            className="w-16 h-16 object-contain"
            draggable={false}
          />
          <div>
            <span className="text-lg font-bold text-white block">AI Sales Agents</span>
            <span className="text-xs text-[#FFB051] bg-[#FFDDB0] px-2 py-0.5 rounded font-semibold uppercase tracking-wide">TRIAL</span>
          </div>
        </div>
        <div className="text-xs text-[#E2CCE6] bg-[#44214B] px-3 py-2 rounded mt-1">
          <span className="font-semibold block mb-1">Ask your AI Salesbot for quick actions.</span>
          <span className="opacity-80">
            Type what you want in the box above to start.
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-1 pt-6 pb-2 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {menuItems.map((item, i) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-4 py-2.5 rounded-md font-medium transition
                    ${
                      isActive
                        ? 'bg-[#EFE7FA] text-[#613067] shadow border border-[#D2A7F3]'
                        : 'text-[#EED7FF] hover:bg-[#4B2252] hover:text-white'
                    }
                  `}
                  style={{ 
                    marginLeft: isActive ? '2px' : '0', 
                    borderLeftWidth: isActive ? '4px' : '0',
                    borderLeftColor: isActive ? '#FFB051' : 'transparent'
                  }}
                >
                  <Icon size={20} className={isActive ? 'text-[#BA3C92]' : 'text-[#AA93B1] group-hover:text-white transition'} />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* New Client Button */}
      <div className="px-5 pb-7 pt-2 mt-auto border-t border-[#5A314F] bg-[#341730]">
        <button className="w-full bg-[#BA3C92] hover:bg-[#C844A9] text-white py-3 rounded-md font-semibold flex items-center justify-center gap-2 text-base transition active:scale-95 shadow">
          <Plus size={20} />
          <span>New Client</span>
        </button>
      </div>
    </aside>
  )
}