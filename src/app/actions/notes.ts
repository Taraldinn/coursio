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
    const note = await prisma.note.upsert({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId,
        },
      },
      update: {
        content,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        videoId,
        content,
      },
    })

    return { success: true, noteId: note.id }
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
    const note = await prisma.note.findUnique({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId,
        },
      },
    })

    return note?.content || ""
  } catch (error) {
    console.error("Error fetching note:", error)
    return ""
  }
}
