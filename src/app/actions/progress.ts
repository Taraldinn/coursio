"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function updateProgress(
  videoId: string,
  watchedDuration: number,
  completed: boolean = false
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const progress = await prisma.userVideoProgress.upsert({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId,
        },
      },
      update: {
        watchedDuration,
        completed,
        lastWatchedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        videoId,
        watchedDuration,
        completed,
      },
    })

    return { success: true, progressId: progress.id }
  } catch (error) {
    console.error("Error updating progress:", error)
    return { error: "Failed to update progress" }
  }
}

export async function markVideoCompleted(videoId: string) {
  return updateProgress(videoId, 0, true)
}

export async function getPlaylistProgress(playlistId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { total: 0, completed: 0, percentage: 0 }
  }

  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        videos: {
          include: {
            progress: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!playlist) {
      return { total: 0, completed: 0, percentage: 0 }
    }

    const total = playlist.videos.length
    const completed = playlist.videos.filter(
      (v) => v.progress[0]?.completed
    ).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, percentage }
  } catch (error) {
    console.error("Error fetching progress:", error)
    return { total: 0, completed: 0, percentage: 0 }
  }
}
