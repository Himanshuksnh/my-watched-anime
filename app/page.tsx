"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import AnimeCard from "@/components/anime-card"
import LoadingSkeleton from "@/components/loading-skeleton"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    fetchAnimes()
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

  const filteredAnimes = animes.filter((anime) => {
    const matchesSearch = anime.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLanguage = selectedLanguage === "all" || anime.language === selectedLanguage
    return matchesSearch && matchesLanguage
  })

  // Sort: featuredRank 1-10 first, then randomize the rest by default, or sort by selected sort
  function shuffle(array: Anime[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }
  const featured = filteredAnimes
    .filter((a) => typeof a.featuredRank === "number" && a.featuredRank >= 1 && a.featuredRank <= 10)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99))
  let rest = filteredAnimes.filter((a) => !a.featuredRank || a.featuredRank < 1 || a.featuredRank > 10)
  if (sortBy === "newest") {
    rest = [...rest].sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
  } else if (sortBy === "episodes") {
    rest = [...rest].sort((a, b) => b.totalEpisodes - a.totalEpisodes)
  } else {
    rest = shuffle(rest)
  }
  const sortedAnimes = [...featured, ...rest]

  const groupedAnimes = sortedAnimes.reduce(
    (acc, anime) => {
      if (!acc[anime.language]) {
        acc[anime.language] = []
      }
      acc[anime.language].push(anime)
      return acc
    },
    {} as Record<string, Anime[]>,
  )

  const languages = [...new Set(animes.map((anime) => anime.language))]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Anime Collection
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">Discover amazing anime from around the world</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search anime..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="episodes">Most Episodes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-8">
            {[1, 2, 3].map((section) => (
              <div key={section}>
                <div className="h-7 bg-muted rounded w-40 mb-3 animate-pulse" />
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[1, 2, 3, 4].map((card) => (
                    <div key={card} className="min-w-[140px] max-w-[160px] w-[45vw] sm:w-[140px] md:w-[160px]">
                      <LoadingSkeleton />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Anime Groups - Horizontal Scroll */}
        {!loading && Object.keys(groupedAnimes).length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No anime found matching your criteria.</p>
          </div>
        )}

        {!loading &&
          Object.entries(groupedAnimes).map(([language, animeList]) => (
            <div key={language} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {language}
                  </span>
                  <span className="text-xs text-muted-foreground font-normal">
                    ({animeList.length} anime{animeList.length !== 1 ? "s" : ""})
                  </span>
                </h2>
                <button
                  className="px-3 py-1 rounded bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
                  onClick={() => window.location.href = `/language/${encodeURIComponent(language)}`}
                >
                  View All
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/30">
                {animeList.map((anime, index) => (
                  <div key={anime.id} className="min-w-[180px] max-w-[220px] w-[60vw] sm:w-[180px] md:w-[220px]">
                    <AnimeCard anime={anime} index={index} />
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
