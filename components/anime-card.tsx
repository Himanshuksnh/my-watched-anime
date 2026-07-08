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

const langColorMap: Record<string, string> = {
  Japanese: "japanese",
  Hindi: "hindi",
  English: "english",
  Chinese: "chinese",
}

const langTextMap: Record<string, string> = {
  Japanese: "japanese",
  Hindi: "hindi",
  English: "english",
  Chinese: "chinese",
}

export default function AnimeCard({ anime, onClick }: AnimeCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const langColor = langColorMap[anime.language] || "japanese"
  const langText = langTextMap[anime.language] || "japanese"
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
            sizes="160px"
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
            <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="anime-card-ep-badge">
          {anime.totalEpisodes} eps
        </div>

        {showRankBadge && (
          <div className="anime-card-rank-badge">
            {anime.featuredRank}
          </div>
        )}
      </div>

      <div className={`anime-card-footer lang-color-${langColor}`}>
        <div className="anime-card-name" title={anime.name}>
          {anime.name}
        </div>
        <div className="anime-card-meta">
          <span className={`anime-card-lang lang-text-${langText}`}>
            {anime.language}
          </span>
          <span className="anime-card-eps">
            {anime.totalEpisodes} ep
          </span>
        </div>
      </div>
    </div>
  )
}
