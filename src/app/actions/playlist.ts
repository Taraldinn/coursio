"use server"

import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { fetchYouTubePlaylist, extractYouTubePlaylistId } from "@/lib/youtube"
import { z } from "zod"

const playlistSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  categoryId: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).default('PUBLIC'),
})

export async function createPlaylistFromYouTube(youtubeUrl: string) {
  const user = await currentUser()
  
  if (!user?.id) {
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

    // Generate unique slug from title
    const baseSlug = youtubeData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    let slug = baseSlug
    let counter = 1
    while (await prisma.playlist.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const playlist = await prisma.playlist.create({
      data: {
        title: youtubeData.title,
        description: youtubeData.description,
        thumbnail: youtubeData.thumbnail,
        youtubePlaylistId: playlistId,
        userId: user.id,
        slug,
        mode: 'YOUTUBE_IMPORT',
        visibility: 'PUBLIC',
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
  const user = await currentUser()
  
  if (!user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      thumbnail: formData.get("thumbnail") as string,
      categoryId: formData.get("categoryId") as string | undefined,
      visibility: (formData.get("visibility") as string) || 'PUBLIC',
    }

    const validated = playlistSchema.parse(data)

    const playlist = await prisma.playlist.create({
      data: {
        ...validated,
        userId: user.id,
      },
    })

    revalidatePath("/dashboard")
    
    return { success: true, playlistId: playlist.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    return { error: "Failed to create playlist" }
  }
}

export async function deletePlaylist(playlistId: string) {
  const user = await currentUser()
  
  if (!user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist || playlist.userId !== user.id) {
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

export async function updatePlaylistVisibility(playlistId: string, visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE') {
  const user = await currentUser()
  
  if (!user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist || playlist.userId !== user.id) {
      return { error: "Playlist not found" }
    }

    await prisma.playlist.update({
      where: { id: playlistId },
      data: { visibility },
    })

    revalidatePath("/dashboard")
    revalidatePath("/")
    
    return { success: true }
  } catch (error) {
    return { error: "Failed to update playlist" }
  }
}
