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
  imagePosition?: number
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
    Japanese: "#c084fc",
    Hindi: "#f472b6",
    English: "#a78bfa",
    Chinese: "#34d399",
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
        <div className="mb-8 animate-fade-in-up">
          <button
            className="mb-6 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
            style={{ 
              backgroundColor: '#141622',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
            onClick={() => router.back()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back
          </button>
          
          <div>
            <h1 
              className="text-2xl md:text-3xl font-bold mb-1"
              style={{ 
                fontFamily: "'Space Grotesk', sans-serif",
                color: langColors[lang] || '#c084fc'
              }}
            >
              {lang} Anime
            </h1>
            <p className="text-sm" style={{ color: '#64748b' }}>
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
                backgroundColor: '#141622',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#f1f5f9' }}>
              No anime found
            </h3>
            <p className="text-sm" style={{ color: '#64748b' }}>
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
