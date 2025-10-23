"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import AnimeForm from "@/components/anime-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Plus, Download, Film, PlayCircle, Globe, AlertTriangle } from "lucide-react"

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

export default function AdminPanel() {
  const [locked, setLocked] = useState(true)
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [editRanks, setEditRanks] = useState<{ [id: string]: string }>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const [editAnime, setEditAnime] = useState<Partial<Anime>>({})
  const [editLoading, setEditLoading] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [downloadOptions, setDownloadOptions] = useState({
    name: true,
    language: true,
    season: true,
    episodes: true,
    featuredRank: true,
    imageUrl: true,
  })

  useEffect(() => {
    fetchAnimes()
  }, [])

  const fetchAnimes = async () => {
    setLoading(true)
    const q = query(collection(db, "animes"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    setAnimes(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Anime[])
    setLoading(false)
    setSelectedAnime(null)
    setEditAnime({})
  }

  const handleRankChange = (id: string, value: string) => {
    setEditRanks((prev) => ({ ...prev, [id]: value }))
  }

  const saveRank = async (id: string) => {
    setSaving(id)
    const animeDoc = doc(db, "animes", id)
    const rank = editRanks[id] ? Number(editRanks[id]) : null
    await updateDoc(animeDoc, { featuredRank: rank })
    setSaving(null)
    fetchAnimes()
  }

  const deleteAnime = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this anime?")) return
    setDeleting(id)
    await deleteDoc(doc(db, "animes", id))
    setDeleting(null)
    fetchAnimes()
  }

  // Download anime list as text file
  const downloadAnimeList = () => {
    let textContent = "ANIME COLLECTION LIST\n"
    textContent += "=".repeat(50) + "\n\n"
    textContent += `Total Anime: ${animes.length}\n`
    textContent += `Generated: ${new Date().toLocaleString()}\n\n`
    textContent += "=".repeat(50) + "\n\n"

    // Group by language
    const grouped = animes.reduce((acc, anime) => {
      const lang = anime.language || "Unknown"
      if (!acc[lang]) acc[lang] = []
      acc[lang].push(anime)
      return acc
    }, {} as Record<string, Anime[]>)

    Object.entries(grouped).forEach(([language, animeList]) => {
      textContent += `\n${language.toUpperCase()} (${animeList.length} anime)\n`
      textContent += "-".repeat(50) + "\n"
      
      animeList.forEach((anime, index) => {
        if (downloadOptions.name) {
          textContent += `${index + 1}. ${anime.name}\n`
        }
        if (downloadOptions.language && anime.language) {
          textContent += `   Language: ${anime.language}\n`
        }
        if (downloadOptions.season && anime.season) {
          textContent += `   Season: ${anime.season}\n`
        }
        if (downloadOptions.episodes) {
          textContent += `   Episodes: ${anime.totalEpisodes || "N/A"}\n`
        }
        if (downloadOptions.featuredRank && anime.featuredRank) {
          textContent += `   Featured Rank: ${anime.featuredRank}\n`
        }
        if (downloadOptions.imageUrl) {
          textContent += `   Image: ${anime.imageUrl}\n`
        }
        textContent += "\n"
      })
    })

    // Create and download file
    const blob = new Blob([textContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `anime-list-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setShowDownloadModal(false)
  }

  const toggleDownloadOption = (option: keyof typeof downloadOptions) => {
    setDownloadOptions(prev => ({ ...prev, [option]: !prev[option] }))
  }

  // Edit anime details
  const openEditModal = (anime: Anime) => {
    setSelectedAnime(anime)
    setEditAnime({ ...anime })
  }

  const closeEditModal = () => {
    setSelectedAnime(null)
    setEditAnime({})
  }

  const handleEditChange = (field: keyof Anime, value: string) => {
    setEditAnime((prev) => ({ ...prev, [field]: value }))
  }

  const saveAnimeEdit = async () => {
    if (!selectedAnime) return
    setEditLoading(true)
    const animeDoc = doc(db, "animes", selectedAnime.id)
    await updateDoc(animeDoc, {
      name: editAnime.name,
      language: editAnime.language || null,
      season: editAnime.season || null,
      totalEpisodes: editAnime.totalEpisodes ? Number(editAnime.totalEpisodes) : null,
      featuredRank: editAnime.featuredRank ? Number(editAnime.featuredRank) : null,
    })
    setEditLoading(false)
    closeEditModal()
    fetchAnimes()
  }

  // Calculate statistics
  const totalAnimes = animes.length
  const totalEpisodes = animes.reduce((sum, anime) => sum + (anime.totalEpisodes || 0), 0)
  const languageStats = animes.reduce((acc, anime) => {
    const lang = anime.language || "Unknown"
    if (!acc[lang]) {
      acc[lang] = { count: 0, episodes: 0 }
    }
    acc[lang].count++
    acc[lang].episodes += anime.totalEpisodes || 0
    return acc
  }, {} as Record<string, { count: number; episodes: number }>)

  // Filter incomplete anime (missing season or episodes)
  const incompleteAnimes = animes.filter(anime => !anime.season || !anime.totalEpisodes || anime.totalEpisodes === 0)
  const completeAnimes = animes.filter(anime => anime.season && anime.totalEpisodes && anime.totalEpisodes > 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Lock Screen */}
        {locked ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Card className="max-w-sm w-full p-6 border border-purple-600 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Shield className="h-6 w-6 text-purple-600" />
                  Admin Panel Locked
                </CardTitle>
                <CardDescription>Enter password to access admin features</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-purple-400 rounded bg-white text-black focus:border-purple-600 focus:outline-none mb-3"
                  placeholder="Enter password..."
                  value={passwordInput}
                  onChange={e => { setPasswordInput(e.target.value); setPasswordError("") }}
                  onKeyDown={e => { if (e.key === "Enter") { if (passwordInput === "himanshu4526") { setLocked(false) } else { setPasswordError("Incorrect password") } } }}
                />
                <button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded font-semibold hover:from-purple-700 hover:to-pink-700 transition mb-2"
                  onClick={() => { if (passwordInput === "himanshu4526") { setLocked(false) } else { setPasswordError("Incorrect password") } }}
                >
                  Unlock
                </button>
                {passwordError && <div className="text-red-600 text-sm text-center">{passwordError}</div>}
              </CardContent>
            </Card>
          </div>
        ) : (
          // ...existing code...
          <>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-purple-600" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Manage your anime collection</p>
          </div>

          {/* Statistics Cards */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Anime */}
              <Card className="border-purple-200 dark:border-purple-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Anime</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {totalAnimes}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <Film className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Episodes */}
              <Card className="border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Episodes</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        {totalEpisodes.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                      <PlayCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Languages */}
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Languages</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {Object.keys(languageStats).length}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Language Breakdown */}
            {Object.keys(languageStats).length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Language Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(languageStats)
                      .sort(([, a], [, b]) => b.count - a.count)
                      .map(([lang, stats]) => (
                        <div key={lang} className="bg-muted/50 rounded-lg p-3 border">
                          <p className="font-semibold text-sm truncate">{lang}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {stats.count} anime • {stats.episodes.toLocaleString()} eps
                          </p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Incomplete Anime Alert */}
            {incompleteAnimes.length > 0 && (
              <Card className="mt-4 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-5 w-5" />
                    Incomplete Anime ({incompleteAnimes.length})
                  </CardTitle>
                  <CardDescription>These anime are missing season or episode information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {incompleteAnimes.map((anime) => (
                      <div 
                        key={anime.id} 
                        className="flex items-center justify-between p-3 bg-background rounded-lg border border-orange-200 dark:border-orange-800 hover:bg-orange-100/50 dark:hover:bg-orange-900/20 cursor-pointer transition"
                        onClick={() => openEditModal(anime)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{anime.name}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                            {!anime.season && <span className="text-orange-600">• Missing Season</span>}
                            {(!anime.totalEpisodes || anime.totalEpisodes === 0) && <span className="text-orange-600">• Missing Episodes</span>}
                          </div>
                        </div>
                        <button
                          className="px-3 py-1 rounded bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors"
                          onClick={(e) => { e.stopPropagation(); openEditModal(anime); }}
                        >
                          Complete
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Admin Actions */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Add New Anime */}
            {!showForm ? (
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-purple-500/50 transition-colors">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Anime
                  </CardTitle>
                  <CardDescription>Click below to add a new anime to your collection</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus className="h-4 w-4" />
                    Add Anime
                  </button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Anime</CardTitle>
                  <CardDescription>Fill in the details below to add a new anime to your collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnimeForm onSuccess={() => { setShowForm(false); fetchAnimes(); }} onCancel={() => setShowForm(false)} />
                </CardContent>
              </Card>
            )}

            {/* Manage Existing Anime */}
            <Card>
              <CardHeader>
                <CardTitle>Manage Uploaded Anime</CardTitle>
                <CardDescription>Edit, search, or delete anime. Click an anime to edit its details.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Bar and Download Button */}
                <div className="mb-4 flex flex-col md:flex-row gap-3 justify-between">
                  <input
                    type="text"
                    className="w-full md:w-1/2 px-3 py-2 border border-purple-400 rounded text-sm bg-white text-black focus:border-purple-600 focus:outline-none"
                    placeholder="Search anime by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button
                    onClick={() => setShowDownloadModal(true)}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
                    disabled={animes.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Download List ({animes.length})
                  </button>
                </div>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading anime...</div>
                ) : animes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No anime found.</div>
                ) : (
                  <div className="space-y-4">
                    {completeAnimes.filter(a => a.name.toLowerCase().includes(search.toLowerCase())).map((anime) => (
                      <div key={anime.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 border-b pb-2 cursor-pointer hover:bg-muted/50 transition" onClick={() => openEditModal(anime)}>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{anime.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{anime.language || "No language"} | {anime.season || "No season"} | {anime.totalEpisodes || "No episodes"} episodes</div>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          className="w-20 px-2 py-1 border rounded text-sm"
                          placeholder="Rank"
                          value={editRanks[anime.id] ?? (anime.featuredRank ?? "")}
                          onChange={(e) => handleRankChange(anime.id, e.target.value)}
                          disabled={saving === anime.id}
                          onClick={e => e.stopPropagation()}
                        />
                        <button
                          className="px-3 py-1 rounded bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60"
                          onClick={e => { e.stopPropagation(); saveRank(anime.id); }}
                          disabled={saving === anime.id}
                        >
                          {saving === anime.id ? "Saving..." : "Save Rank"}
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                          onClick={e => { e.stopPropagation(); deleteAnime(anime.id); }}
                          disabled={deleting === anime.id}
                        >
                          {deleting === anime.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Download Options Modal */}
                {showDownloadModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-background border border-green-600 rounded-xl shadow-2xl p-8 w-full max-w-md relative">
                      <button className="absolute top-2 right-2 text-2xl text-muted-foreground hover:text-green-600" onClick={() => setShowDownloadModal(false)}>&times;</button>
                      <h2 className="text-2xl font-bold mb-2 text-green-600 flex items-center gap-2">
                        <Download className="h-6 w-6" />
                        Download Options
                      </h2>
                      <p className="text-sm text-muted-foreground mb-6">Select what information to include in the text file</p>
                      
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded transition">
                          <input
                            type="checkbox"
                            checked={downloadOptions.name}
                            onChange={() => toggleDownloadOption("name")}
                            className="w-5 h-5 accent-green-600"
                          />
                          <div>
                            <span className="font-semibold">Anime Name</span>
                            <p className="text-xs text-muted-foreground">Include anime titles</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded transition">
                          <input
                            type="checkbox"
                            checked={downloadOptions.language}
                            onChange={() => toggleDownloadOption("language")}
                            className="w-5 h-5 accent-green-600"
                          />
                          <div>
                            <span className="font-semibold">Language</span>
                            <p className="text-xs text-muted-foreground">Include language information</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded transition">
                          <input
                            type="checkbox"
                            checked={downloadOptions.season}
                            onChange={() => toggleDownloadOption("season")}
                            className="w-5 h-5 accent-green-600"
                          />
                          <div>
                            <span className="font-semibold">Season</span>
                            <p className="text-xs text-muted-foreground">Include season details</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded transition">
                          <input
                            type="checkbox"
                            checked={downloadOptions.episodes}
                            onChange={() => toggleDownloadOption("episodes")}
                            className="w-5 h-5 accent-green-600"
                          />
                          <div>
                            <span className="font-semibold">Total Episodes</span>
                            <p className="text-xs text-muted-foreground">Include episode count</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded transition">
                          <input
                            type="checkbox"
                            checked={downloadOptions.featuredRank}
                            onChange={() => toggleDownloadOption("featuredRank")}
                            className="w-5 h-5 accent-green-600"
                          />
                          <div>
                            <span className="font-semibold">Featured Rank</span>
                            <p className="text-xs text-muted-foreground">Include featured ranking (1-10)</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded transition">
                          <input
                            type="checkbox"
                            checked={downloadOptions.imageUrl}
                            onChange={() => toggleDownloadOption("imageUrl")}
                            className="w-5 h-5 accent-green-600"
                          />
                          <div>
                            <span className="font-semibold">Image URL</span>
                            <p className="text-xs text-muted-foreground">Include Cloudinary image links</p>
                          </div>
                        </label>
                      </div>

                      <div className="flex gap-3 mt-8">
                        <button 
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded font-semibold hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2" 
                          onClick={downloadAnimeList}
                        >
                          <Download className="h-4 w-4" />
                          Download Now
                        </button>
                        <button 
                          className="flex-1 bg-muted px-4 py-2 rounded font-semibold text-muted-foreground hover:bg-green-100" 
                          onClick={() => setShowDownloadModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Modal */}
                {selectedAnime && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-background border border-purple-600 rounded-xl shadow-2xl p-8 w-full max-w-md relative">
                      <button className="absolute top-2 right-2 text-2xl text-muted-foreground hover:text-purple-600" onClick={closeEditModal}>&times;</button>
                      <h2 className="text-2xl font-bold mb-6 text-purple-600">Edit Anime</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-muted-foreground">Name</label>
                          <input type="text" className="w-full px-3 py-2 border border-purple-400 rounded bg-white text-black focus:border-purple-600 focus:outline-none" value={editAnime.name || ""} onChange={e => handleEditChange("name", e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-muted-foreground">Language</label>
                          <input type="text" className="w-full px-3 py-2 border border-purple-400 rounded bg-white text-black focus:border-purple-600 focus:outline-none" value={editAnime.language || ""} onChange={e => handleEditChange("language", e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-muted-foreground">Season</label>
                          <input type="text" className="w-full px-3 py-2 border border-purple-400 rounded bg-white text-black focus:border-purple-600 focus:outline-none" value={editAnime.season || ""} onChange={e => handleEditChange("season", e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-muted-foreground">Total Episodes</label>
                          <input type="number" min="1" className="w-full px-3 py-2 border border-purple-400 rounded bg-white text-black focus:border-purple-600 focus:outline-none" value={editAnime.totalEpisodes || ""} onChange={e => handleEditChange("totalEpisodes", e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-muted-foreground">Featured Rank</label>
                          <input type="number" min="1" max="10" className="w-full px-3 py-2 border border-purple-400 rounded bg-white text-black focus:border-purple-600 focus:outline-none" value={editAnime.featuredRank || ""} onChange={e => handleEditChange("featuredRank", e.target.value)} />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-8">
                        <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded font-semibold hover:from-purple-700 hover:to-pink-700 transition" onClick={saveAnimeEdit} disabled={editLoading}>{editLoading ? "Saving..." : "Save Changes"}</button>
                        <button className="flex-1 bg-muted px-4 py-2 rounded font-semibold text-muted-foreground hover:bg-purple-100" onClick={closeEditModal} disabled={editLoading}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </>
        )}
      </div>
    </div>
  )
}
