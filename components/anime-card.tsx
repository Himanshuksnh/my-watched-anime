"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Calendar, Hash } from "lucide-react"

interface Anime {
  id: string
  name: string
  language: string
  season?: string
  totalEpisodes: number
  imageUrl: string
}

interface AnimeCardProps {
  anime: Anime
  index: number
}

export default function AnimeCard({ anime, index }: AnimeCardProps) {
  // Format season display for better clarity
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
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  return (
    <Card
      className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 bg-card/50 backdrop-blur-sm min-h-[340px] md:min-h-[400px]"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="relative overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-muted">
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 animate-pulse" />
          )}

          {!imageError ? (
            <Image
              src={anime.imageUrl || "/placeholder.svg"}
              alt={anime.name}
              fill
              priority={index === 0}
              className={`object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 flex items-center justify-center">
              <Play className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Language Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-black/50 text-white border-0 backdrop-blur-sm">
              {anime.language}
            </Badge>
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5 space-y-4">
          <h3 className="font-bold text-xl line-clamp-2 group-hover:text-purple-600 transition-colors duration-200">
            {anime.name}
          </h3>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              <span>{anime.totalEpisodes} episodes</span>
            </div>

            {seasonDisplay && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{seasonDisplay}</span>
              </div>
            )}
          </div>

          {/* Progress Bar Animation */}
          <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out" />
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
