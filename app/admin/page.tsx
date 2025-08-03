"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import AnimeForm from "@/components/anime-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Plus } from "lucide-react"

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
                {/* Search Bar */}
                <div className="mb-4 flex justify-end">
                  <input
                    type="text"
                    className="w-full md:w-1/2 px-3 py-2 border border-purple-400 rounded text-sm bg-white text-black focus:border-purple-600 focus:outline-none"
                    placeholder="Search anime by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading anime...</div>
                ) : animes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No anime found.</div>
                ) : (
                  <div className="space-y-4">
                    {animes.filter(a => a.name.toLowerCase().includes(search.toLowerCase())).map((anime) => (
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
