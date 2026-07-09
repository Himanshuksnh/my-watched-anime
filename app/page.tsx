"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import AnimeCard from "@/components/anime-card"
import AnimeDetailModal from "@/components/anime-detail-modal"
import HeroBanner from "@/components/hero-banner"
import LoadingSkeleton from "@/components/loading-skeleton"

interface Anime {
  id: string
  name: string
  language: string
  season?: string
  totalEpisodes: number
  imageUrl: string
  createdAt: any
  featuredRank?: number | null
  imagePosition?: number
}

export default function HomePage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bannerCount, setBannerCount] = useState(5)
  const [bannerInterval, setBannerInterval] = useState(5)
  const [search, setSearch] = useState("")
  const [languageFilter, setLanguageFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")

  useEffect(() => {
    fetchAnimes()
    const savedCount = localStorage.getItem('bannerCount')
    const savedInterval = localStorage.getItem('bannerInterval')
    if (savedCount) setBannerCount(Number(savedCount))
    if (savedInterval) setBannerInterval(Number(savedInterval))
  }, [])

  const fetchAnimes = async () => {
    try {
      const q = query(collection(db, "animes"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const animesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Anime[]
      setAnimes(animesData)
    } catch (error) {
      console.error("Error fetching animes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnimeClick = (anime: Anime) => {
    setSelectedAnime(anime)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAnime(null)
  }

  const heroAnimes = animes
    .filter(a => a.featuredRank && a.featuredRank >= 1 && a.featuredRank <= bannerCount)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99))

  const heroIds = new Set(heroAnimes.map(a => a.id))

  const filteredAnimes = animes
    .filter(a => !heroIds.has(a.id))
    .filter(a => {
      if (search) {
        return a.name.toLowerCase().includes(search.toLowerCase())
      }
      return true
    })
    .filter(a => {
      if (languageFilter !== "all") {
        return a.language === languageFilter
      }
      return true
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      }
      if (sortOrder === "oldest") {
        return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
      }
      if (sortOrder === "a-z") {
        return a.name.localeCompare(b.name)
      }
      if (sortOrder === "z-a") {
        return b.name.localeCompare(a.name)
      }
      return 0
    })

  const groupedAnimes = filteredAnimes.reduce(
    (acc, anime) => {
      if (!acc[anime.language]) {
        acc[anime.language] = []
      }
      acc[anime.language].push(anime)
      return acc
    },
    {} as Record<string, Anime[]>,
  )

  const langColors: Record<string, string> = {
    Japanese: "#c084fc",
    Hindi: "#f472b6",
    English: "#a78bfa",
    Chinese: "#34d399",
  }

  const languages = [...new Set(animes.map(a => a.language))].sort()

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
        {/* Hero Banner */}
        {!loading && heroAnimes.length > 0 && (
          <HeroBanner
            animes={heroAnimes}
            onAnimeClick={handleAnimeClick}
            interval={bannerInterval}
          />
        )}

        {loading && (
          <div className="hero-banner animate-pulse rounded-2xl" style={{ backgroundColor: '#141622' }} />
        )}

        {/* Search & Filters */}
        <div className="search-container mb-8">
          <div className="search-input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              className="search-input"
              placeholder="Search anime..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
          >
            <option value="all">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">A - Z</option>
            <option value="z-a">Z - A</option>
          </select>
        </div>

        {/* Anime Shelves */}
        <div className="space-y-8">
          {loading ? (
            [1, 2, 3].map((section) => (
              <div key={section} className="animate-fade-in-up" style={{ animationDelay: `${section * 0.1}s` }}>
                <div className="section-header">
                  <div className="h-5 rounded w-32" style={{ backgroundColor: '#1e2030' }} />
                  <div className="h-8 rounded w-20" style={{ backgroundColor: '#1e2030' }} />
                </div>
                <div className="shelf-row">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((card) => (
                    <div key={card} className="shelf-item card-width-desktop">
                      <LoadingSkeleton />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : Object.keys(groupedAnimes).length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg" style={{ color: '#64748b' }}>No anime found</p>
            </div>
          ) : (
            Object.entries(groupedAnimes).map(([language, animeList], groupIndex) => (
              <div
                key={language}
                className="animate-fade-in-up"
                style={{ animationDelay: `${groupIndex * 0.05}s` }}
              >
                <div className="section-header">
                  <div className="section-title" style={{ color: langColors[language] || '#c084fc' }}>
                    {language}
                    <span className="section-title-count">({animeList.length} animes)</span>
                  </div>
                  <a
                    href={`/language/${encodeURIComponent(language)}`}
                    className="section-view-all"
                  >
                    View All
                  </a>
                </div>

                <div className="shelf-row">
                  {animeList.map((anime) => (
                    <div key={anime.id} className="shelf-item card-width-desktop">
                      <AnimeCard
                        anime={anime}
                        onClick={() => handleAnimeClick(anime)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimeDetailModal
        anime={selectedAnime}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
