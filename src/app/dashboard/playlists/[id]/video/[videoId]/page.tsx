import { redirect, notFound } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

interface VideoPageProps {
  params: Promise<{
    id: string
    videoId: string
  }>
}

export default async function VideoPage({ params }: VideoPageProps) {
  const user = await currentUser()

  if (!user?.id) {
    redirect("/sign-in")
  }

  const { id, videoId } = await params

  const video = await prisma.video.findUnique({
    where: {
      id: videoId,
      playlistId: id,
    },
    select: {
      id: true,
      playlist: {
        select: {
          slug: true,
        },
      },
    },
  })

  if (!video?.playlist?.slug) {
    notFound()
  }

  // Redirect to new watch route
  redirect(`/playlist/${video.playlist.slug}/watch?video=${videoId}`)
}
