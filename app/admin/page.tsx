"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import AnimeForm from "@/components/anime-form"

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
  const [bannerCount, setBannerCount] = useState(5)
  const [bannerInterval, setBannerInterval] = useState(5)
  const [hoveredAnime, setHoveredAnime] = useState<Anime | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    fetchAnimes()
    const savedCount = localStorage.getItem('bannerCount')
    const savedInterval = localStorage.getItem('bannerInterval')
    if (savedCount) setBannerCount(Number(savedCount))
    if (savedInterval) setBannerInterval(Number(savedInterval))
  }, [])

  const saveBannerSettings = () => {
    localStorage.setItem('bannerCount', String(bannerCount))
    localStorage.setItem('bannerInterval', String(bannerInterval))
    alert('Banner settings saved!')
  }

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

  const saveImagePosition = async (id: string, position: number) => {
    setSaving(id)
    const animeDoc = doc(db, "animes", id)
    await updateDoc(animeDoc, { imagePosition: position })
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

  const downloadAnimeList = () => {
    let textContent = "ANIME COLLECTION LIST\n"
    textContent += "=".repeat(50) + "\n\n"
    textContent += `Total Anime: ${animes.length}\n`
    textContent += `Generated: ${new Date().toLocaleString()}\n\n`
    textContent += "=".repeat(50) + "\n\n"

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
        if (downloadOptions.name) textContent += `${index + 1}. ${anime.name}\n`
        if (downloadOptions.language && anime.language) textContent += `   Language: ${anime.language}\n`
        if (downloadOptions.season && anime.season) textContent += `   Season: ${anime.season}\n`
        if (downloadOptions.episodes) textContent += `   Episodes: ${anime.totalEpisodes || "N/A"}\n`
        if (downloadOptions.featuredRank && anime.featuredRank) textContent += `   Featured Rank: ${anime.featuredRank}\n`
        if (downloadOptions.imageUrl) textContent += `   Image: ${anime.imageUrl}\n`
        textContent += "\n"
      })
    })

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

  const openEditModal = (anime: Anime) => {
    setSelectedAnime(anime)
    setEditAnime({ ...anime })
  }

  const closeEditModal = () => {
    setSelectedAnime(null)
    setEditAnime({})
  }

  const handleEditChange = (field: keyof Anime, value: any) => {
    setEditAnime((prev) => ({ ...prev, [field]: value }))
  }

  const saveImagePositionInModal = async (position: number) => {
    if (!selectedAnime) return
    handleEditChange("imagePosition", position)
    setEditLoading(true)
    const animeDoc = doc(db, "animes", selectedAnime.id)
    await updateDoc(animeDoc, { imagePosition: position })
    setEditLoading(false)
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
      imagePosition: editAnime.imagePosition ?? 50,
    })
    setEditLoading(false)
    closeEditModal()
    fetchAnimes()
  }

  const totalAnimes = animes.length
  const totalEpisodes = animes.reduce((sum, anime) => sum + (anime.totalEpisodes || 0), 0)
  const languageStats = animes.reduce((acc, anime) => {
    const lang = anime.language || "Unknown"
    if (!acc[lang]) acc[lang] = { count: 0, episodes: 0 }
    acc[lang].count++
    acc[lang].episodes += anime.totalEpisodes || 0
    return acc
  }, {} as Record<string, { count: number; episodes: number }>)

  const incompleteAnimes = animes.filter(anime => !anime.season || !anime.totalEpisodes || anime.totalEpisodes === 0)
  const completeAnimes = animes.filter(anime => anime.season && anime.totalEpisodes && anime.totalEpisodes > 0)

  const langColors: Record<string, string> = {
    Japanese: "var(--lang-japanese)",
    Hindi: "var(--lang-hindi)",
    English: "var(--lang-english)",
    Chinese: "var(--lang-chinese)",
  }

  // Locked Screen
  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div 
          className="w-full max-w-sm p-8 rounded-2xl"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)'
          }}
        >
          <div className="text-center mb-6">
            <div 
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-orange))' }}
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
            >
              Admin Panel
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Enter password to access
            </p>
          </div>
          
          <input
            type="password"
            className="w-full px-4 py-3 rounded-lg text-sm mb-4"
            style={{ 
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)'
            }}
            placeholder="Password..."
            value={passwordInput}
            onChange={e => { setPasswordInput(e.target.value); setPasswordError("") }}
            onKeyDown={e => { if (e.key === "Enter") { if (passwordInput === "himanshu4526") { setLocked(false) } else { setPasswordError("Incorrect password") } } }}
          />
          
          <button
            className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-orange))' }}
            onClick={() => { if (passwordInput === "himanshu4526") { setLocked(false) } else { setPasswordError("Incorrect password") } }}
          >
            Unlock
          </button>
          
          {passwordError && (
            <p className="text-red-400 text-sm text-center mt-3">{passwordError}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
          >
            Admin Panel
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Manage your anime collection
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div 
            className="p-5 rounded-xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Total Anime</p>
                <p 
                  className="text-3xl font-bold"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--lang-japanese)' }}
                >
                  {totalAnimes}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(232, 93, 117, 0.15)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--lang-japanese)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            className="p-5 rounded-xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Total Episodes</p>
                <p 
                  className="text-3xl font-bold"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--lang-english)' }}
                >
                  {totalEpisodes.toLocaleString()}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(77, 168, 218, 0.15)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--lang-english)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            className="p-5 rounded-xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Languages</p>
                <p 
                  className="text-3xl font-bold"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--lang-hindi)' }}
                >
                  {Object.keys(languageStats).length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(232, 135, 61, 0.15)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--lang-hindi)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Settings */}
        <div 
          className="p-6 rounded-xl mb-8"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        >
          <h2 
            className="text-lg font-semibold mb-4 flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
          >
            <svg className="w-5 h-5" style={{ color: 'var(--lang-japanese)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Hero Banner Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Banner Anime Count
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={bannerCount}
                  onChange={(e) => setBannerCount(Number(e.target.value))}
                  className="flex-1 accent-purple-600"
                />
                <span 
                  className="text-2xl font-bold w-12 text-center"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--lang-japanese)' }}
                >
                  {bannerCount}
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                Showing {animes.filter(a => a.featuredRank && a.featuredRank >= 1 && a.featuredRank <= bannerCount).length} anime
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Slide Interval (seconds)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={bannerInterval}
                  onChange={(e) => setBannerInterval(Number(e.target.value))}
                  className="flex-1 accent-purple-600"
                />
                <span 
                  className="text-2xl font-bold w-12 text-center"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--lang-english)' }}
                >
                  {bannerInterval}s
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={saveBannerSettings}
            className="mt-6 px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-orange))' }}
          >
            Save Settings
          </button>
        </div>

        {/* Add Anime */}
        <div className="mb-8">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full p-6 rounded-xl border-2 border-dashed transition-all duration-200 hover:scale-[1.01]"
              style={{ 
                borderColor: 'var(--border-default)',
                backgroundColor: 'var(--bg-card)'
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Add New Anime</span>
              </div>
            </button>
          ) : (
            <div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 
                  className="text-lg font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
                >
                  Add New Anime
                </h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
              </div>
              <AnimeForm onSuccess={() => { setShowForm(false); fetchAnimes(); }} onCancel={() => setShowForm(false)} />
            </div>
          )}
        </div>

        {/* Search & Anime List */}
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                style={{ color: 'var(--text-secondary)' }} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
                style={{ 
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Search anime..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowDownloadModal(true)}
              className="px-4 py-2.5 rounded-lg font-medium text-white text-sm flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, var(--accent-cyan), #0891b2)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download ({animes.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
              Loading...
            </div>
          ) : completeAnimes.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
              No anime found
            </div>
          ) : (
            <div className="space-y-2">
              {completeAnimes
                .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
                .map((anime) => (
                  <div 
                    key={anime.id}
                    className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid var(--border-default)' }}
                    onClick={() => openEditModal(anime)}
                    onMouseEnter={(e) => {
                      setHoveredAnime(anime)
                      setHoverPosition({ x: e.clientX, y: e.clientY })
                      e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'
                    }}
                    onMouseMove={(e) => setHoverPosition({ x: e.clientX, y: e.clientY })}
                    onMouseLeave={(e) => {
                      setHoveredAnime(null)
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {anime.name}
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: langColors[anime.language] || 'var(--text-secondary)' }}>
                          {anime.language}
                        </span>
                        {' · '}
                        {anime.season || 'No season'} · {anime.totalEpisodes || 0} eps
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="w-16 px-2 py-1.5 rounded text-sm text-center"
                        style={{ 
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)',
                          fontFamily: "'JetBrains Mono', monospace"
                        }}
                        placeholder="Rank"
                        value={editRanks[anime.id] ?? (anime.featuredRank ?? "")}
                        onChange={(e) => handleRankChange(anime.id, e.target.value)}
                        disabled={saving === anime.id}
                      />
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className="w-20 accent-purple-600"
                          value={anime.imagePosition ?? 50}
                          onChange={(e) => saveImagePosition(anime.id, Number(e.target.value))}
                          disabled={saving === anime.id}
                        />
                        <span 
                          className="text-xs w-8 text-right"
                          style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}
                        >
                          {anime.imagePosition ?? 50}%
                        </span>
                      </div>
                      
                      <button
                        className="px-3 py-1.5 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: 'var(--lang-japanese)' }}
                        onClick={(e) => { e.stopPropagation(); saveRank(anime.id) }}
                        disabled={saving === anime.id}
                      >
                        {saving === anime.id ? '...' : 'Save'}
                      </button>
                      
                      <button
                        className="px-3 py-1.5 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: '#ef4444' }}
                        onClick={(e) => { e.stopPropagation(); deleteAnime(anime.id) }}
                        disabled={deleting === anime.id}
                      >
                        {deleting === anime.id ? '...' : 'Del'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Download Modal */}
        {showDownloadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div 
              className="w-full max-w-md p-6 rounded-2xl"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-xl font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
                >
                  Download Options
                </h2>
                <button 
                  onClick={() => setShowDownloadModal(false)}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3 mb-6">
                {Object.entries(downloadOptions).map(([key, value]) => (
                  <label 
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                    style={{ backgroundColor: value ? 'rgba(77, 168, 218, 0.1)' : 'transparent' }}
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => toggleDownloadOption(key as keyof typeof downloadOptions)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--lang-english)' }}
                    />
                    <div>
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={downloadAnimeList}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--accent-cyan), #0891b2)' }}
                >
                  Download
                </button>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="flex-1 py-2.5 rounded-lg font-semibold"
                  style={{ 
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-default)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {selectedAnime && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div 
              className="w-full max-w-lg p-6 rounded-2xl max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-xl font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
                >
                  Edit Anime
                </h2>
                <button 
                  onClick={closeEditModal}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-lg text-sm"
                    style={{ 
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
                    value={editAnime.name || ""} 
                    onChange={e => handleEditChange("name", e.target.value)} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Language</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-lg text-sm"
                      style={{ 
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
                      value={editAnime.language || ""} 
                      onChange={e => handleEditChange("language", e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Season</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 rounded-lg text-sm"
                      style={{ 
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
                      value={editAnime.season || ""} 
                      onChange={e => handleEditChange("season", e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Episodes</label>
                    <input 
                      type="number" 
                      min="1"
                      className="w-full px-4 py-2.5 rounded-lg text-sm"
                      style={{ 
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        fontFamily: "'JetBrains Mono', monospace"
                      }}
                      value={editAnime.totalEpisodes || ""} 
                      onChange={e => handleEditChange("totalEpisodes", e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Featured Rank</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      className="w-full px-4 py-2.5 rounded-lg text-sm"
                      style={{ 
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        fontFamily: "'JetBrains Mono', monospace"
                      }}
                      value={editAnime.featuredRank || ""} 
                      onChange={e => handleEditChange("featuredRank", e.target.value)} 
                    />
                  </div>
                </div>

                {/* Image Position */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Image Position (0% = Top, 50% = Center, 100% = Bottom)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="flex-1 accent-purple-600"
                      value={editAnime.imagePosition ?? 50}
                      onChange={e => saveImagePositionInModal(Number(e.target.value))}
                      disabled={editLoading}
                    />
                    <span 
                      className="text-lg font-bold w-14 text-center"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--lang-japanese)' }}
                    >
                      {editAnime.imagePosition ?? 50}%
                    </span>
                  </div>
                  
                  {/* Banner Preview */}
                  {editAnime.imageUrl && (
                    <div className="mt-3">
                      <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Banner Preview:</p>
                      <div className="relative w-full aspect-[16/6] rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
                        <div 
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${editAnime.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: `center ${editAnime.imagePosition ?? 50}%`
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-2 left-3 right-3">
                          <p className="text-white text-sm font-semibold truncate">{editAnime.name}</p>
                          <p className="text-white/70 text-xs">{editAnime.language} · {editAnime.totalEpisodes} eps</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveAnimeEdit}
                  disabled={editLoading}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-orange))' }}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={closeEditModal}
                  disabled={editLoading}
                  className="flex-1 py-2.5 rounded-lg font-semibold disabled:opacity-50"
                  style={{ 
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-default)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hover Preview */}
        {hoveredAnime && hoveredAnime.imageUrl && (
          <div 
            className="fixed z-50 pointer-events-none"
            style={{ left: hoverPosition.x + 15, top: hoverPosition.y - 60 }}
          >
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
            >
              <div className="relative w-48 aspect-[16/6] rounded overflow-hidden">
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${hoveredAnime.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: `center ${hoveredAnime.imagePosition ?? 50}%`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-1 left-2 right-2">
                  <p className="text-white text-[10px] font-semibold truncate">{hoveredAnime.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
