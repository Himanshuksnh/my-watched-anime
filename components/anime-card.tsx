"use client"

import { useState } from "react"
import Image from "next/image"

interface Anime {
  id: string
  name: string
  language: string
  season?: string
  totalEpisodes: number
  imageUrl: string
  featuredRank?: number | null
  imagePosition?: number
}

interface AnimeCardProps {
  anime: Anime
  onClick?: () => void
}

export default function AnimeCard({ anime, onClick }: AnimeCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const showRankBadge = typeof anime.featuredRank === "number" && anime.featuredRank >= 1 && anime.featuredRank <= 10

  const getObjectPosition = (position?: number) => {
    const pos = position ?? 50
    return `center ${pos}%`
  }

  return (
    <div
      className="anime-card card-width-desktop"
      onClick={onClick}
    >
      <div className="anime-card-poster">
        {imageLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a24] to-[#12121a] animate-pulse" />
        )}

        {!imageError ? (
          <Image
            src={anime.imageUrl || "/placeholder.svg"}
            alt={anime.name}
            fill
            sizes="180px"
            className={`object-cover transition-transform duration-300 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            style={{ objectPosition: getObjectPosition(anime.imagePosition) }}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
        )}

        <div className="anime-card-lang-badge">
          {anime.language}
        </div>

        {showRankBadge && (
          <div className="anime-card-rank-badge">
            {anime.featuredRank}
          </div>
        )}
      </div>

      <div className="anime-card-footer">
        <div className="anime-card-name" title={anime.name}>
          {anime.name}
        </div>
        <div className="anime-card-meta">
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
            {anime.totalEpisodes} episodes
          </span>
          {anime.season && (
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <path d="M3 9h18"/>
                <path d="M9 21V9"/>
              </svg>
              Season {anime.season}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
