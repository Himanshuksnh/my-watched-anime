export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration is missing. Please check your environment variables.")
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", uploadPreset)
  formData.append("folder", "anime-collection") // Optional: organize uploads in a folder

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Cloudinary API Error:", data)
      throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    if (data.error) {
      console.error("Cloudinary Upload Error:", data.error)
      throw new Error(data.error.message || "Upload failed")
    }

    return data.secure_url
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to upload image to Cloudinary")
  }
}
