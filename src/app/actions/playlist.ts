"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { fetchYouTubePlaylist, extractYouTubePlaylistId } from "@/lib/youtube"
import { z } from "zod"

const playlistSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  categoryId: z.string().optional(),
  isPublic: z.boolean().default(true),
})

export async function createPlaylistFromYouTube(youtubeUrl: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const playlistId = extractYouTubePlaylistId(youtubeUrl)
    
    if (!playlistId) {
      return { error: "Invalid YouTube playlist URL" }
    }

    // Check if playlist already imported
    const existing = await prisma.playlist.findUnique({
      where: { youtubePlaylistId: playlistId },
    })

    if (existing) {
      return { error: "Playlist already imported" }
    }

    const youtubeData = await fetchYouTubePlaylist(playlistId)

    const playlist = await prisma.playlist.create({
      data: {
        title: youtubeData.title,
        description: youtubeData.description,
        thumbnail: youtubeData.thumbnail,
        youtubePlaylistId: playlistId,
        userId: session.user.id,
        videos: {
          create: youtubeData.videos,
        },
      },
      include: {
        videos: true,
      },
    })

    revalidatePath("/dashboard")
    
    return { success: true, playlistId: playlist.id }
  } catch (error) {
    console.error("Error creating playlist:", error)
    return { error: "Failed to import playlist" }
  }
}

export async function createCustomPlaylist(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      thumbnail: formData.get("thumbnail") as string,
      categoryId: formData.get("categoryId") as string,
      isPublic: formData.get("isPublic") === "true",
    }

    const validated = playlistSchema.parse(data)

    const playlist = await prisma.playlist.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
    })

    revalidatePath("/dashboard")
    
    return { success: true, playlistId: playlist.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to create playlist" }
  }
}

export async function deletePlaylist(playlistId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist || playlist.userId !== session.user.id) {
      return { error: "Playlist not found" }
    }

    await prisma.playlist.delete({
      where: { id: playlistId },
    })

    revalidatePath("/dashboard")
    
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete playlist" }
  }
}

export async function updatePlaylistVisibility(playlistId: string, isPublic: boolean) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist || playlist.userId !== session.user.id) {
      return { error: "Playlist not found" }
    }

    await prisma.playlist.update({
      where: { id: playlistId },
      data: { isPublic },
    })

    revalidatePath("/dashboard")
    revalidatePath("/")
    
    return { success: true }
  } catch (error) {
    return { error: "Failed to update playlist" }
  }
}
