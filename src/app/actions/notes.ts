"use server"

import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function upsertNote(videoId: string, content: string) {
  const user = await currentUser()
  
  if (!user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    // Update the notes field on the Video model
    const video = await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        notes: content,
        updatedAt: new Date(),
      },
    })

    return { success: true, videoId: video.id }
  } catch (error) {
    console.error("Error saving note:", error)
    return { error: "Failed to save note" }
  }
}

export async function getNote(videoId: string) {
  const user = await currentUser()
  
  if (!user?.id) {
    return null
  }

  try {
    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
      select: {
        notes: true,
      },
    })

    return video?.notes || ""
  } catch (error) {
    console.error("Error fetching note:", error)
    return ""
  }
}
