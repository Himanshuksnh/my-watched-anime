"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav 
      className="sticky top-0 z-50"
      style={{ 
        backgroundColor: 'rgba(11, 13, 23, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-2.5 group" href="/">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}
            >
              <span 
                className="text-white text-sm font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                A
              </span>
            </div>
            <span 
              className="text-base font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#f1f5f9' }}
            >
              Anime Collection
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ 
                color: pathname === "/" ? '#f1f5f9' : '#94a3b8',
                backgroundColor: pathname === "/" ? 'rgba(255,255,255,0.06)' : 'transparent'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
              Home
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ 
                color: pathname === "/admin" ? '#f1f5f9' : '#94a3b8',
                backgroundColor: pathname === "/admin" ? 'rgba(255,255,255,0.06)' : 'transparent'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
              </svg>
              Admin
            </Link>
          </div>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/"
            className="p-2 rounded-lg transition-colors"
            style={{ 
              color: pathname === "/" ? '#f1f5f9' : '#94a3b8',
              backgroundColor: pathname === "/" ? 'rgba(255,255,255,0.06)' : 'transparent'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          </Link>
          <Link
            href="/admin"
            className="p-2 rounded-lg transition-colors"
            style={{ 
              color: pathname === "/admin" ? '#f1f5f9' : '#94a3b8',
              backgroundColor: pathname === "/admin" ? 'rgba(255,255,255,0.06)' : 'transparent'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  )
}
