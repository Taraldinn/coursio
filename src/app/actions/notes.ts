"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function upsertNote(videoId: string, content: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const note = await prisma.note.upsert({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId,
        },
      },
      update: {
        content,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
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
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }

  try {
    const note = await prisma.note.findUnique({
      where: {
        userId_videoId: {
          userId: session.user.id,
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
