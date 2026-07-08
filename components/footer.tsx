"use client"

export default function Footer() {
  return (
    <footer 
      className="py-6 mt-auto"
      style={{ borderTop: '1px solid var(--border-default)' }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-orange))' }}
            >
              <span 
                className="text-white text-xs font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                A
              </span>
            </div>
            <span 
              className="text-sm font-medium"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-secondary)' }}
            >
              Anime Collection
            </span>
          </div>

          <p 
            className="text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            Your personal anime tracking companion
          </p>
        </div>
      </div>
    </footer>
  )
}
