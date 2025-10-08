export async function uploadToImgbb(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY
  
  if (!apiKey) {
    throw new Error("ImgBB API key not configured")
  }

  const formData = new FormData()
  formData.append("image", file)

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const data = await response.json()
    
return data.data.url
  } catch (error) {
    console.error("Error uploading to ImgBB:", error)
    throw error
  }
}
