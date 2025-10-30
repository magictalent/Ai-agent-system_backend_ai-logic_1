'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

const navLinks = [
  { name: 'Dashboard', href: '/' },
  { name: 'Profile', href: '/profile' },
]

function Topbar() {
  const pathname = usePathname()
  return (
    <nav className="w-full bg-[#191b34]/80 backdrop-blur-md border-b border-[#23254d]/70 fixed top-0 left-0 z-40 px-0 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-[54px]">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-4">
          <img
            src="/logo23.png"
            alt="Sellient Logo"
            className="h-12 w-auto"
            style={{ maxHeight: 56, filter: 'brightness(0) saturate(100%) invert(57%) sepia(94%) saturate(3707%) hue-rotate(2deg) brightness(103%) contrast(105%)' }}
          />
        </div>

        {/* Center: Navigation */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-5">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1 text-sm font-medium rounded transition-all px-2 py-1 ${
                  pathname === link.href
                    ? 'text-[#58A6FF] bg-[#191b34]/40'
                    : 'text-[#bcc4ea] hover:text-white hover:bg-[#191b34]/40'
                }`}
              >
                {/* Icon for nav item based on name */}
                {link.name === 'Dashboard' && (
                  <svg width="16" height="16" fill="none" className="inline-block" viewBox="0 0 16 16">
                    <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke={pathname === link.href ? "#58A6FF" : "#bcc4ea"} />
                    <rect x="4.5" y="7.5" width="7" height="1" rx=".5" fill={pathname === link.href ? "#58A6FF" : "#bcc4ea"} />
                  </svg>
                )}
                {link.name === 'Profile' && (
                  <svg width="16" height="16" fill="none" className="inline-block" viewBox="0 0 16 16">
                    <circle cx="8" cy="6" r="2.5" stroke={pathname === link.href ? "#58A6FF" : "#bcc4ea"} />
                    <ellipse cx="8" cy="11.25" rx="4" ry="2.25" stroke={pathname === link.href ? "#58A6FF" : "#bcc4ea"} />
                  </svg>
                )}
                <span>{link.name}</span>
              </Link>
            ))}
             <Link href="/developing" className="flex items-center gap-2 text-[#bcc4ea] hover:text-white transition px-2 py-1">
              <svg width="16" height="16" fill="none" className="inline-block" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="7" stroke="#58A6FF" strokeWidth="1.2" fill="none"/>
                <path d="M7.999 11.6v-1.21c0-.935 1.6-.98 1.6-2.19 0-.769-.675-1.4-1.6-1.4-.884 0-1.56.563-1.6 1.26" stroke="#58A6FF" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="8" cy="12" r="0.71" fill="#58A6FF"/>
              </svg>
              <span className="text-sm">Help</span>
            </Link>
            <Link href="/login" className="flex items-center gap-2 text-[#bcc4ea] hover:text-white transition px-2 py-1">
              <svg width="16" height="16" fill="none" className="inline-block" viewBox="0 0 16 16">
                <path d="M8 3.5v9M3.5 8h9" stroke="#58A6FF" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className="text-sm">Log In</span>
            </Link>
           

          </div>
        </div>

        {/* Right: Button */}
        <div>
          <Link href="/login">
            <button className="px-6 py-2 rounded-lg bg-[#58A6FF] text-white font-semibold text-sm shadow hover:bg-[#2678C5] transition">
              SIGN IN
            </button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Topbar />
      <div className="pt-[72px]">{children}</div>
    </div>
  )
}
