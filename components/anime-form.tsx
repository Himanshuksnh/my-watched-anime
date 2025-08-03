"use client"

import type React from "react"

import { useState } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Loader2, CheckCircle, X, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AnimeFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function AnimeForm({ onSuccess, onCancel }: AnimeFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    language: "",
    season: "",
    totalEpisodes: "",
    featuredRank: ""
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null) // Clear error when user starts typing
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB")
        return
      }

      setImageFile(file)
      setError(null)

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Anime name is required")
      return false
    }
    if (!imageFile) {
      setError("Please select an image")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setUploadProgress(10)

    try {
      // Check environment variables
      if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
        throw new Error("Cloudinary configuration is missing. Please check your environment variables.")
      }

      // Upload image to Cloudinary
      setUploadProgress(30)
      toast({
        title: "Uploading image...",
        description: "Please wait while we upload your image.",
      })

      const imageUrl = await uploadToCloudinary(imageFile!)
      setUploadProgress(70)

      // Save to Firestore
      toast({
        title: "Saving anime...",
        description: "Adding anime to your collection.",
      })

      await addDoc(collection(db, "animes"), {
        name: formData.name.trim(),
        language: formData.language || null,
        season: formData.season.trim() || null,
        totalEpisodes: formData.totalEpisodes ? Number.parseInt(formData.totalEpisodes) : null,
        imageUrl,
        createdAt: serverTimestamp(),
        featuredRank: formData.featuredRank ? Number(formData.featuredRank) : null,
      })

      setUploadProgress(100)

      toast({
        title: "Success!",
        description: "Anime has been added to your collection.",
      })

      // Reset form
      setFormData({ name: "", language: "", season: "", totalEpisodes: "", featuredRank: "" })
      setImageFile(null)
      setImagePreview(null)

      setTimeout(() => {
        onSuccess()
      }, 1000)
    } catch (error) {
      console.error("Error adding anime:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add anime. Please try again."
      setError(errorMessage)

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Environment Variables Check */}
      {(!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cloudinary configuration is missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and
            NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variables.
          </AlertDescription>
        </Alert>
      )}

      {/* Image Upload */}
      <div className="space-y-2">
        <Label htmlFor="image">Anime Image *</Label>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={loading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image")?.click()}
              className="w-full h-32 border-2 border-dashed border-muted-foreground/25 hover:border-purple-500/50 transition-colors"
              disabled={loading}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {imageFile ? imageFile.name : "Click to upload image (max 10MB)"}
                </span>
              </div>
            </Button>
          </div>

          {imagePreview && (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="featuredRank">Featured Rank (1-10, optional)</Label>
          <Input
            id="featuredRank"
            type="number"
            min="1"
            max="10"
            value={formData.featuredRank}
            onChange={(e) => handleInputChange("featuredRank", e.target.value)}
            placeholder="Set 1-10 to feature this anime"
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Anime Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter anime name"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language *</Label>
          <Select
            value={formData.language}
            onValueChange={(value) => handleInputChange("language", value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Japanese">Japanese</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Korean">Korean</SelectItem>
              <SelectItem value="Chinese">Chinese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="season">Season (Optional)</Label>
          <Input
            id="season"
            value={formData.season}
            onChange={(e) => handleInputChange("season", e.target.value)}
            placeholder="e.g., Spring 2024"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="episodes">Total Episodes *</Label>
          <Input
            id="episodes"
            type="number"
            min="1"
            value={formData.totalEpisodes}
            onChange={(e) => handleInputChange("totalEpisodes", e.target.value)}
            placeholder="Enter total episodes"
            disabled={loading}
          />
        </div>
      </div>

      {/* Progress Bar */}
      {loading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {uploadProgress < 50
                ? "Uploading image..."
                : uploadProgress < 90
                  ? "Saving to database..."
                  : "Almost done..."}
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={
            loading ||
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
          }
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Anime...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Add Anime
            </>
          )}
        </Button>

        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  )
}
