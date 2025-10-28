'use client'

import { LayoutDashboard, Megaphone, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Leads', href: '/leads' },
  { icon: Megaphone, label: 'Campaigns', href: '/campaigns' },
  { icon: Megaphone, label: 'Integrations', href: '/integrations' },
  { icon: Megaphone, label: 'Analytics', href: '/analytics' },
  { icon: Megaphone, label: 'Onboarding', href: '/onboarding' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="bg-[#3B1C3A] min-h-screen w-[260px] flex flex-col border-r-0 shadow-lg relative z-30">
      {/* Sidebar top: logo and trial notice */}
      <div className="px-5 pt-6 pb-5 border-b border-[#5A314F]">
        <div className="flex items-center gap-2 mb-5">
          <Link href="/">
            <img
              src="/logo.png"
              alt="AI Sales Agents Logo"
              className="w-16 h-16 object-contain"
              draggable={false}
            />
          </Link>
          <div>
            <span className="text-lg font-bold text-white block">AI Sales Agents</span>
            <span className="text-xs text-[#FFB051] bg-[#FFDDB0] px-2 py-0.5 rounded font-semibold uppercase tracking-wide">TRIAL</span>
          </div>
        </div>
        <div className="text-xs text-[#E2CCE6] bg-[#44214B] px-3 py-2 rounded mt-1">
          <span className="font-semibold block mb-1">Ask your AI Salesbot for quick actions.</span>
          <input
            type="text"
            placeholder="Ask your AI Salesbot..."
            className="w-full bg-[#51305C] text-[#FFB051] px-3 py-2 rounded outline-none border border-[#71537A] focus:border-[#FFB051] placeholder:text-[#E2CCE6] placeholder:opacity-70 text-sm"
          
          />
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="px-1 pt-6 pb-2 overflow-y-auto"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#3B1C3A"
        }}
      >
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

      {/* Footer space */}
      <div className="px-5 pb-7 pt-2 mt-auto border-t border-[#5A314F] bg-[#341730]" />
    </aside>
  )
}
