"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav 
      className="sticky top-0 z-50"
      style={{ 
        backgroundColor: 'var(--bg-page)',
        borderBottom: '1px solid var(--border-default)'
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link className="flex items-center gap-2.5 group" href="/">
          <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-orange))' }}
          >
            <span 
              className="text-white text-base font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              A
            </span>
          </div>
          <span 
            className="hidden sm:block text-base font-semibold"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
          >
            Anime Collection
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{ 
              color: pathname === "/" ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: pathname === "/" ? 'rgba(255,255,255,0.06)' : 'transparent'
            }}
          >
            Home
          </Link>
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{ 
              color: pathname === "/admin" ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: pathname === "/admin" ? 'rgba(255,255,255,0.06)' : 'transparent'
            }}
          >
            Admin
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/"
            className="p-2 rounded-lg transition-colors"
            style={{ 
              color: pathname === "/" ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: pathname === "/" ? 'rgba(255,255,255,0.06)' : 'transparent'
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <Link
            href="/admin"
            className="p-2 rounded-lg transition-colors"
            style={{ 
              color: pathname === "/admin" ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: pathname === "/admin" ? 'rgba(255,255,255,0.06)' : 'transparent'
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  )
}
