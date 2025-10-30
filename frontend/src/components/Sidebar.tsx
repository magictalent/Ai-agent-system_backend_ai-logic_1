'use client'

import Calendar from '@/app/calendar/page'
import { sign } from 'crypto'
import { LayoutDashboard,DollarSign, Megaphone, Users, MessageCircle, BarChart4, Calendar1, Wrench, Cog, Building2, Factory, TicketCheck, Phone, ListChecks,HelpCircle, BookOpenCheck, MessageSquareDashed, Scissors, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Item = { icon?: any; label: string; href?: string; divider?: boolean }
type Group = { key: string; icon: any; label: string; items: Item[] }

const groups: Group[] = [
  {
    key: 'crm',
    icon: Users,
    label: 'CRM',
    items: [
      { icon: Users, label: 'Contacts', href: '/leads' },
      { icon: Building2, label: 'Companies', href: '/clients' },
      { icon: Factory, label: 'Deals', href: '/developing' },
      { icon: TicketCheck, label: 'Tickets', href: '/messages' },
      { icon: Factory, label: 'Orders', href: '/orders' },
      { divider: true, label: 'divider' },
      { icon: ListChecks, label: 'Segments (Lists)', href: '/segments' },
      { icon: MessageCircle, label: 'Inbox', href: '/messages' },
      { icon: Phone, label: 'Calls', href: '/calls' },
      { icon: ListChecks, label: 'Tasks', href: '/tasks' },
      { icon: BookOpenCheck, label: 'Playbooks', href: '/playbooks' },
      { icon: MessageSquareDashed, label: 'Message Templates', href: '/templates' },
      { icon: Scissors, label: 'Snippets', href: '/snippets' },
    ],
  },
  { key: 'campaigns', icon: Megaphone, label: 'Campaigns', items: [
    { label: 'All Campaigns', href: '/campaigns' },
    { label: 'Create Campaign', href: '/campaigns/new' },
  ] },
  { key: 'analytics', icon: BarChart4, label: 'Analytics', items: [{ label: 'Overview', href: '/analytics' }] },
  { key: 'integrations', icon: Wrench, label: 'Integrations', items: [{ label: 'Manage', href: '/integrations' }] },
  { key: 'settings', icon: Cog, label: 'Settings', items: [{ label: 'Settings', href: '/settings' },{ label: 'Profile', href: '/profile' }] },
  { key: 'calendar', icon: Calendar1, label: 'Calendar', items: [{ label: 'Calendar', href: '/calendar' },] },
  { key: 'pricing', icon: DollarSign, label: 'Pricing', items: [{ label: 'Pricing', href: '/pricing' }] },
  { key: 'help', icon: HelpCircle, label: 'Help', items: [{ label: 'Help', href: '/developing' }] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const iconRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Hide sidebar on navigation (mobile)
  useEffect(() => {
    setOpen(false)
    setActivePanel(null)
  }, [pathname])

  // Clicking outside closes the panel
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (
        // Click is not inside any panel
        !Object.values(panelRefs.current).some(
          (panel) => panel && panel.contains(e.target as Node)
        ) &&
        // Click is not inside any icon
        !Object.values(iconRefs.current).some(
          (btn) => btn && btn.contains(e.target as Node)
        )
      ) {
        setActivePanel(null)
      }
    }
    if (activePanel) {
      document.addEventListener('mousedown', onDoc)
      return () => document.removeEventListener('mousedown', onDoc)
    }
  }, [activePanel])

  useEffect(() => {
    const handler = () => setOpen((v) => !v)
    window.addEventListener('toggle-sidebar', handler)
    return () => window.removeEventListener('toggle-sidebar', handler)
  }, [])

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-30 md:hidden ${open ? 'block' : 'hidden'}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`bg-[#35112A] h-[calc(100vh-56px)] w-[56px] md:w-[64px] flex flex-col items-center py-3 z-40 fixed md:fixed top-14 left-0 transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex-1 flex flex-col gap-1 relative">
          {/* Dashboard shortcut */}
          <Link
            href="/dashboard"
            className={`relative w-12 h-12 md:w-14 md:h-14 grid place-items-center rounded-lg text-white/80 hover:bg-white/10 ${
              pathname.startsWith('/dashboard') ? 'bg-white/10 ring-1 ring-white/20' : ''
            }`}
            aria-label="Dashboard"
          >
            <LayoutDashboard size={20} />
          </Link>

          {groups.map((g) => {
            const ActiveIcon = g.icon
            const active =
              (activePanel === g.key) ||
              pathname.startsWith('/' + (g.key === 'crm' ? 'leads' : g.key))
            return (
              <div className="relative" key={g.key}>
                <button
                  ref={el => { iconRefs.current[g.key] = el }}
                  className={`relative w-12 h-12 md:w-14 md:h-14 grid place-items-center rounded-lg text-white/80 hover:bg-white/10 ${
                    active ? 'bg-white/10 ring-1 ring-white/20' : ''
                  }`}
                  aria-label={g.label}
                  type="button"
                  tabIndex={0}
                  onClick={() => setActivePanel((p) => (p === g.key ? null : g.key))}
                >
                  <ActiveIcon size={20} />
                </button>
                {/* Panel shown inline beside icon */}
                {activePanel === g.key && (
                  <div
                    ref={el => { panelRefs.current[g.key] = el }}
                    className="absolute top-0 left-[105%] z-50 min-w-[260px] w-72 bg-[#3F1634] text-white rounded-xl shadow-2xl border border-white/10 p-3 ml-2"
                    style={{
                      minHeight: '40px',
                      maxHeight: 'calc(100vh - 60px)',
                      overflowY: 'auto',
                    }}
                  >
                    <div className="px-2 py-1 text-xs uppercase tracking-wider text-white/70">
                      {g.label}
                    </div>
                    <ul className="mt-1">
                      {g.items.map((it, idx) =>
                        it.divider ? (
                          <li key={`div-${idx}`} className="my-2 h-px bg-white/10" />
                        ) : (
                          <li key={it.label}>
                            <Link
                              href={it.href || '#'}
                              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-white/10"
                              onClick={() => setActivePanel(null)}
                            >
                              <div className="flex items-center gap-3">
                                {it.icon && <it.icon size={16} className="text-white/80" />}
                                <span className="text-sm">{it.label}</span>
                              </div>
                              <ChevronRight size={16} className="text-white/40" />
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-auto mb-2 text-xs text-white/50">v1</div>
      </aside>
    </>
  )
}
