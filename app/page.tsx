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
}

export default function HomePage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bannerCount, setBannerCount] = useState(5)
  const [bannerInterval, setBannerInterval] = useState(5)

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
  const filteredAnimes = animes.filter(a => !heroIds.has(a.id))

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
    Japanese: "var(--lang-japanese)",
    Hindi: "var(--lang-hindi)",
    English: "var(--lang-english)",
    Chinese: "var(--lang-chinese)",
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
        {!loading && heroAnimes.length > 0 && (
          <HeroBanner
            animes={heroAnimes}
            onAnimeClick={handleAnimeClick}
            interval={bannerInterval}
          />
        )}

        {loading && (
          <div className="hero-banner animate-pulse rounded-2xl" style={{ backgroundColor: 'var(--bg-card)' }} />
        )}

        <div className="mt-8 space-y-8">
          {loading ? (
            [1, 2, 3].map((section) => (
              <div key={section} className="animate-fade-in-up" style={{ animationDelay: `${section * 0.1}s` }}>
                <div className="section-header">
                  <div className="h-5 rounded w-24 animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
                  <div className="h-4 rounded w-16 animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
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
          ) : (
            Object.entries(groupedAnimes).map(([language, animeList], groupIndex) => (
              <div
                key={language}
                className="animate-fade-in-up"
                style={{ animationDelay: `${groupIndex * 0.05}s` }}
              >
                <div className="section-header">
                  <h2
                    className="section-title"
                    style={{ color: langColors[language] || "var(--text-primary)" }}
                  >
                    {language}
                  </h2>
                  <a
                    href={`/language/${encodeURIComponent(language)}`}
                    className="section-view-all"
                  >
                    View All →
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
