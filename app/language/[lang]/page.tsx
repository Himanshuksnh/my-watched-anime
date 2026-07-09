"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import AnimeCard from "@/components/anime-card"
import AnimeDetailModal from "@/components/anime-detail-modal"
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

export default function LanguageAnimePage({ params }: { params: { lang: string } }) {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const lang = decodeURIComponent(params.lang)

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const q = query(collection(db, "animes"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)
        const animesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Anime[]
        setAnimes(animesData.filter(anime => anime.language?.toLowerCase() === lang.toLowerCase()))
      } catch (error) {
        console.error("Error fetching animes:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnimes()
  }, [lang])

  const handleAnimeClick = (anime: Anime) => {
    setSelectedAnime(anime)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAnime(null)
  }

  function shuffle(array: Anime[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  const featured = animes
    .filter((a) => typeof a.featuredRank === "number" && a.featuredRank >= 1 && a.featuredRank <= 10)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99))
  const rest = shuffle(animes.filter((a) => !a.featuredRank || a.featuredRank < 1 || a.featuredRank > 10))
  const sortedAnimes = [...featured, ...rest]

  const langColors: Record<string, string> = {
    Japanese: "var(--lang-japanese)",
    Hindi: "var(--lang-hindi)",
    English: "var(--lang-english)",
    Chinese: "var(--lang-chinese)",
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
        <div className="mb-8 animate-fade-in-up">
          <button
            className="mb-6 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)'
            }}
            onClick={() => router.back()}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div>
            <h1 
              className="text-2xl md:text-3xl font-bold mb-1"
              style={{ 
                fontFamily: "'Space Grotesk', sans-serif",
                color: langColors[lang] || "var(--text-primary)"
              }}
            >
              {lang} Anime
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {sortedAnimes.length} anime{sortedAnimes.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i}>
                <LoadingSkeleton />
              </div>
            ))}
          </div>
        ) : sortedAnimes.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div 
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)'
              }}
            >
              <svg className="w-10 h-10" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No anime found
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No anime available for this language
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:gap-3">
            {sortedAnimes.map((anime) => (
              <div key={anime.id}>
                <AnimeCard 
                  anime={anime}
                  onClick={() => handleAnimeClick(anime)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimeDetailModal
        anime={selectedAnime}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
