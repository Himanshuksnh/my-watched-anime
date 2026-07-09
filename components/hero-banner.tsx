"use client"

import { useState, useEffect, useCallback } from "react"
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

interface HeroBannerProps {
  animes: Anime[]
  onAnimeClick: (anime: Anime) => void
  interval?: number
}

export default function HeroBanner({ animes, onAnimeClick, interval = 5 }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning])

  const nextSlide = useCallback(() => {
    const nextIndex = (currentIndex + 1) % animes.length
    goToSlide(nextIndex)
  }, [currentIndex, animes.length, goToSlide])

  const prevSlide = useCallback(() => {
    const prevIndex = (currentIndex - 1 + animes.length) % animes.length
    goToSlide(prevIndex)
  }, [currentIndex, animes.length, goToSlide])

  useEffect(() => {
    if (animes.length <= 1) return
    const timer = setInterval(nextSlide, interval * 1000)
    return () => clearInterval(timer)
  }, [nextSlide, interval, animes.length])

  if (animes.length === 0) return null

  const currentAnime = animes[currentIndex]

  const getObjectPosition = (position?: number) => {
    const pos = position ?? 50
    return `center ${pos}%`
  }

  return (
    <div className="relative w-full">
      <div className="hero-banner" onClick={() => onAnimeClick(currentAnime)}>
        <div className="relative w-full h-full">
          {animes.map((anime, index) => (
            <div
              key={anime.id}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: index === currentIndex ? 1 : 0 }}
            >
              <Image
                src={anime.imageUrl}
                alt={anime.name}
                fill
                className="hero-banner-image"
                style={{ objectPosition: getObjectPosition(anime.imagePosition) }}
                priority={index === 0}
                sizes="100vw"
              />
            </div>
          ))}
        </div>

        <div className="hero-banner-overlay" />

        <div className="hero-banner-badge">
          FEATURED · #{currentAnime.featuredRank}
        </div>

        <div className="hero-banner-content">
          <h1 className="hero-banner-title">{currentAnime.name}</h1>
          <div className="hero-banner-meta">
            <span>{currentAnime.language}</span>
            <span>·</span>
            <span>{currentAnime.totalEpisodes} episodes</span>
            {currentAnime.season && (
              <>
                <span>·</span>
                <span>Season {currentAnime.season}</span>
              </>
            )}
          </div>
        </div>

        {animes.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors z-10"
              style={{ backgroundColor: 'rgba(11, 13, 23, 0.6)', backdropFilter: 'blur(8px)' }}
              onClick={(e) => { e.stopPropagation(); prevSlide() }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors z-10"
              style={{ backgroundColor: 'rgba(11, 13, 23, 0.6)', backdropFilter: 'blur(8px)' }}
              onClick={(e) => { e.stopPropagation(); nextSlide() }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </>
        )}

        {animes.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {animes.map((_, index) => (
              <button
                key={index}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: index === currentIndex ? '24px' : '8px',
                  height: '8px',
                  backgroundColor: index === currentIndex ? '#8b5cf6' : 'rgba(255,255,255,0.3)'
                }}
                onClick={(e) => { e.stopPropagation(); goToSlide(index) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
