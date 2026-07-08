"use client"

import { useEffect } from "react"
import Image from "next/image"
import { X, Play, Calendar, Hash, Globe, Film, Tv, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Anime {
  id: string
  name: string
  language: string
  season?: string
  totalEpisodes: number
  imageUrl: string
  createdAt?: any
  featuredRank?: number | null
}

interface AnimeDetailModalProps {
  anime: Anime | null
  isOpen: boolean
  onClose: () => void
}

export default function AnimeDetailModal({ anime, isOpen, onClose }: AnimeDetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleEscape)
    }
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !anime) return null

  let seasonDisplay = ""
  if (anime.season) {
    if (/^\d+-\d+$/.test(anime.season)) {
      seasonDisplay = `Seasons ${anime.season}`
    } else if (/^\d+$/.test(anime.season)) {
      seasonDisplay = `Season ${anime.season}`
    } else {
      seasonDisplay = anime.season
    }
  }

  const languageColors: Record<string, string> = {
    Hindi: "from-orange-500 to-red-500",
    English: "from-blue-500 to-cyan-500",
    Japanese: "from-pink-500 to-rose-500",
    Chinese: "from-yellow-500 to-orange-500",
  }

  const langGradient = languageColors[anime.language] || "from-purple-500 to-pink-500"

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="modal-backdrop"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`modal-content ${isOpen ? 'active' : ''}`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 border border-white/10 transition-all duration-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Hero Section with Background Image */}
        <div className="modal-hero" style={{ backgroundImage: `url(${anime.imageUrl})` }}>
          <div className="modal-hero-overlay" />
          
          {/* Content overlay at bottom of hero */}
          <div className="modal-hero-content">
            {/* Cover Image */}
            <div className="modal-cover-wrapper">
              <Image
                src={anime.imageUrl || "/placeholder.svg"}
                alt={anime.name}
                width={150}
                height={200}
                className="w-full h-auto"
              />
            </div>

            {/* Title & Meta */}
            <div className="modal-text-details">
              <Badge className={`bg-gradient-to-r ${langGradient} text-white border-0 self-start`}>
                <Globe className="h-3 w-3 mr-1" />
                {anime.language}
              </Badge>
              
              <h2>{anime.name}</h2>
              
              <div className="modal-meta-pills">
                <span>
                  <Play className="h-4 w-4 text-cyan-400" />
                  {anime.totalEpisodes} Episodes
                </span>
                {seasonDisplay && (
                  <span>
                    <Tv className="h-4 w-4 text-cyan-400" />
                    {seasonDisplay}
                  </span>
                )}
                <span>
                  <Film className="h-4 w-4 text-cyan-400" />
                  Series
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="modal-body">
          {/* Main Info */}
          <div className="modal-main-info">
            {/* Description */}
            <div className="info-block">
              <h3>Description</h3>
              <p>
                {anime.name} is a {anime.language} dubbed anime series with {anime.totalEpisodes} episodes.
                {seasonDisplay && ` ${seasonDisplay}.`}
                {" "}Watch all episodes in high quality with English subtitles.
              </p>
            </div>

            {/* Episode Preview Grid */}
            <div className="info-block">
              <h3>Episodes</h3>
              <div className="seasons-container">
                <div className="season-header">
                  <div className="flex items-center justify-between">
                    <span>All Episodes</span>
                    <span className="text-cyan-400 text-sm">{anime.totalEpisodes} eps</span>
                  </div>
                </div>
                <div className="episodes-grid">
                  {Array.from({ length: Math.min(anime.totalEpisodes, 48) }, (_, i) => (
                    <div
                      key={i + 1}
                      className="episode-node"
                    >
                      {i + 1}
                    </div>
                  ))}
                  {anime.totalEpisodes > 48 && (
                    <div className="episode-node text-cyan-400">
                      +{anime.totalEpisodes - 48}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Side Info */}
          <div className="flex flex-col gap-4">
            {/* Stats */}
            <div className="info-block">
              <h3>Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-xl font-bold gradient-text">{anime.totalEpisodes}</p>
                  <p className="text-xs text-gray-400">Episodes</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-xl font-bold gradient-text">{anime.season || "1"}</p>
                  <p className="text-xs text-gray-400">Seasons</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-xl font-bold gradient-text">{anime.language}</p>
                  <p className="text-xs text-gray-400">Language</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-xl font-bold gradient-text">HD</p>
                  <p className="text-xs text-gray-400">Quality</p>
                </div>
              </div>
            </div>

            {/* Quality Badge */}
            <div className="info-block">
              <h3>Quality</h3>
              <div className="flex gap-2">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  1080p HD
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <button className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2 btn-shine">
            <Play className="h-5 w-5 fill-white" />
            Watch Now
          </button>
          <button 
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 border border-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
