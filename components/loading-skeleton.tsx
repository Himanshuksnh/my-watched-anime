"use client"

export default function LoadingSkeleton() {
  return (
    <div 
      className="anime-card card-width-desktop"
      style={{ pointerEvents: 'none' }}
    >
      <div className="anime-card-poster">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a24] to-[#12121a] animate-pulse" />
      </div>
      <div className="anime-card-footer" style={{ borderLeftColor: 'var(--border-default)' }}>
        <div 
          className="h-3 rounded w-3/4 mb-2 animate-pulse"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
        />
        <div className="anime-card-meta">
          <div 
            className="h-2.5 rounded w-12 animate-pulse"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          />
          <div 
            className="h-2.5 rounded w-8 animate-pulse"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          />
        </div>
      </div>
    </div>
  )
}
