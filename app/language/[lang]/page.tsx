"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import AnimeCard from "@/components/anime-card"
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
        // Case-insensitive filter for language
        setAnimes(animesData.filter(anime => anime.language?.toLowerCase() === lang.toLowerCase()))
      } catch (error) {
        console.error("Error fetching animes:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnimes()
  }, [lang])

  // Sort: featuredRank 1-10 first, then randomize the rest
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
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-6">
        <button
          className="mb-6 px-3 py-1 rounded bg-muted text-foreground text-xs font-semibold hover:bg-muted-foreground/10 transition-colors"
          onClick={() => router.back()}
        >
          ← Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {lang} Anime
        </h1>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : sortedAnimes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No anime found for this language.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedAnimes.map((anime, index) => (
              <AnimeCard key={anime.id} anime={anime} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
