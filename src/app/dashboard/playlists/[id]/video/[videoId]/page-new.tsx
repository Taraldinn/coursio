import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { ResizableVideoPage } from "@/components/resizable-video-page"

interface VideoPageProps {
  params: Promise<{
    id: string
    videoId: string
  }>
}

export default async function VideoPage({ params }: VideoPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const { id, videoId } = await params

  const video = await prisma.video.findUnique({
    where: {
      id: videoId,
      playlistId: id,
    },
    include: {
      playlist: {
        include: {
          videos: {
            orderBy: {
              position: "asc",
            },
            include: {
              progress: {
                where: { userId: session.user.id },
              },
            },
          },
        },
      },
      progress: {
        where: {
          userId: session.user.id,
        },
      },
      notes: {
        where: {
          userId: session.user.id,
        },
      },
    },
  })

  if (!video) {
    notFound()
  }

  const currentIndex = video.playlist.videos.findIndex((v: any) => v.id === video.id)
  const prevVideo = currentIndex > 0 ? video.playlist.videos[currentIndex - 1] : null
  const nextVideo = currentIndex < video.playlist.videos.length - 1 ? video.playlist.videos[currentIndex + 1] : null

  const userProgress = video.progress[0]
  const userNote = video.notes[0]

  return (
    <ResizableVideoPage
      video={video}
      playlistId={id}
      userId={session.user.id}
      currentIndex={currentIndex}
      totalVideos={video.playlist.videos.length}
      prevVideo={prevVideo}
      nextVideo={nextVideo}
      userProgress={userProgress}
      userNote={userNote}
    />
  )
}
