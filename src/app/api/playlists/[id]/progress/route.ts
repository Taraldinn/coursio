import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  const { id } = await params

  try {
    const progress = await prisma.userVideoProgress.findMany({
      where: {
        userId,
        video: {
          playlistId: id,
        },
      },
      select: {
        videoId: true,
        completed: true,
      },
    })

    const progressMap: Record<string, boolean> = {}
    progress.forEach((p) => {
      progressMap[p.videoId] = p.completed
    })

    return NextResponse.json(progressMap)
  } catch (error) {
    console.error("Error fetching progress:", error)
    
return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}
