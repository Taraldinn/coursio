import { redirect, notFound } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { VideoPageLayout } from "@/components/video-page-layout"

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
    include: {
      playlist: {
        include: {
          videos: {
            orderBy: {
              position: "asc",
            },
            include: {
              progress: {
                where: {
                  userId: user.id,
                },
              },
            },
          },
        },
      },
      progress: {
        where: {
          userId: user.id,
        },
      },
    },
  })

  if (!video) {
    notFound()
  }

  const userProgress = video.progress[0]

  return (
    <VideoPageLayout
      video={{
        id: video.id,
        title: video.title,
        url: video.url,
        youtubeId: video.youtubeId,
        duration: video.duration,
        notes: video.notes,
      }}
      playlist={{
        id: video.playlist.id,
        title: video.playlist.title,
        videos: video.playlist.videos.map((v) => ({
          id: v.id,
          title: v.title,
          duration: v.duration,
          position: v.position,
          notes: v.notes,
          updatedAt: v.updatedAt,
          progress: v.progress,
        })),
      }}
      playlistId={id}
      userId={user.id}
      initialProgress={userProgress?.watchedDuration || 0}
    />
  )
}
