"use client"

export default function LoadingSkeleton() {
  return (
    <div 
      className="anime-card card-width-desktop"
      style={{ pointerEvents: 'none' }}
    >
      <div className="anime-card-poster">
        <div className="absolute inset-0 animate-pulse" style={{ backgroundColor: '#1a1a24' }} />
        <div 
          className="absolute top-2 right-2 rounded px-2 py-1 animate-pulse"
          style={{ backgroundColor: 'rgba(11, 13, 23, 0.7)', width: '40px', height: '16px' }}
        />
      </div>
      <div className="anime-card-footer">
        <div 
          className="h-4 rounded mb-3 animate-pulse"
          style={{ backgroundColor: '#1e2030', width: '80%' }}
        />
        <div className="anime-card-meta">
          <div 
            className="h-3 rounded animate-pulse"
            style={{ backgroundColor: '#1e2030', width: '60px' }}
          />
          <div 
            className="h-3 rounded animate-pulse"
            style={{ backgroundColor: '#1e2030', width: '50px' }}
          />
        </div>
      </div>
    </div>
  )
}
