"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { fetchYouTubePlaylist } from "@/lib/youtube"

export async function syncPlaylist(playlistId: string, youtubePlaylistId: string) {
  try {
    // Fetch latest data from YouTube
    const youtubeData = await fetchYouTubePlaylist(youtubePlaylistId)
    
    if (!youtubeData.videos || youtubeData.videos.length === 0) {
      return { 
        success: false, 
        error: "No videos found in YouTube playlist" 
      }
    }

    // Get existing videos
    const existingVideos = await prisma.video.findMany({
      where: { playlistId },
      select: { youtubeId: true }
    })

    const existingYoutubeIds = new Set(existingVideos.map((v: { youtubeId: string | null }) => v.youtubeId))
    const newVideos = youtubeData.videos.filter((v: any) => !existingYoutubeIds.has(v.youtubeId))

    // Add new videos
    if (newVideos.length > 0) {
      const maxPosition = await prisma.video.findFirst({
        where: { playlistId },
        orderBy: { position: 'desc' },
        select: { position: true }
      })

      const startPosition = (maxPosition?.position || 0) + 1

      await prisma.video.createMany({
        data: newVideos.map((video: any, index: number) => ({
          playlistId,
          youtubeId: video.youtubeId,
          title: video.title,
          description: video.description || "",
          thumbnail: video.thumbnail,
          duration: video.duration || 0,
          url: video.url,
          position: startPosition + index,
        }))
      })
    }

    // Update playlist metadata
    await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        title: youtubeData.title,
        description: youtubeData.description,
        thumbnail: youtubeData.thumbnail,
        lastSyncedAt: new Date(),
      }
    })

    revalidatePath(`/dashboard/playlists/${playlistId}`)

    return { 
      success: true, 
      addedCount: newVideos.length,
      totalVideos: youtubeData.videos.length 
    }
  } catch (error: any) {
    console.error("Sync error:", error)
    return { 
      success: false, 
      error: error.message || "Failed to sync playlist" 
    }
  }
}

export async function toggleAutoSync(playlistId: string, enabled: boolean) {
  try {
    await prisma.playlist.update({
      where: { id: playlistId },
      data: { autoSync: enabled }
    })

    revalidatePath(`/dashboard/playlists/${playlistId}`)
    return { success: true }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || "Failed to update auto-sync" 
    }
  }
}
