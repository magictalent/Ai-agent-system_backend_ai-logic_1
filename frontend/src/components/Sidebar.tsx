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
    <div className="w-64 bg-white min-h-screen border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">AI Sales Agents</h1>
        <p className="text-sm text-gray-500 mt-1">24/7 AI Sales Team</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* New Client Button */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2">
          <Plus size={20} />
          <span>New Client</span>
        </button>
      </div>
    </div>
  )
}