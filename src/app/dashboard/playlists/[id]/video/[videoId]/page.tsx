import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { VideoPlayer } from "@/components/video-player"
import { EnhancedNoteEditor } from "@/components/enhanced-note-editor"
import { CompactVideoList } from "@/components/compact-video-list"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

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

  const currentIndex = video.playlist.videos.findIndex((v: { id: string }) => v.id === video.id)
  const prevVideo = currentIndex > 0 ? video.playlist.videos[currentIndex - 1] : null
  const nextVideo = currentIndex < video.playlist.videos.length - 1 ? video.playlist.videos[currentIndex + 1] : null

  const userProgress = video.progress[0]
  const userNote = video.notes[0]

  return (
    <div className="h-full space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/playlists/${id}`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Playlist
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Left Sidebar - Notes & Playlist */}
        <div className="space-y-4">
          {/* Compact Playlist Dropdown */}
          <div className="rounded-lg border bg-card">
            <CompactVideoList
              videos={video.playlist.videos}
              currentVideoId={video.id}
              playlistId={id}
              userId={session.user.id}
            />
          </div>

          {/* Enhanced Notes Editor */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Notes</h3>
            <EnhancedNoteEditor 
              videoId={video.id} 
              initialContent={userNote?.content || ""} 
            />
          </div>
        </div>

        {/* Right Main Content - Video */}
        <div className="space-y-4">
          <div className="space-y-3">
            <VideoPlayer
              videoId={video.id}
              url={video.url}
              youtubeId={video.youtubeId}
              initialProgress={userProgress?.currentTime || 0}
            />
            <div>
              <h1 className="text-xl font-bold">{video.title}</h1>
              {video.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{video.description}</p>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t pt-3">
            <Button variant="outline" size="sm" disabled={!prevVideo} asChild={!!prevVideo}>
              {prevVideo ? (
                <Link href={`/dashboard/playlists/${id}/video/${prevVideo.id}`}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Link>
              ) : (
                <span>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </span>
              )}
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {video.playlist.videos.length}
            </span>

            <Button variant="outline" size="sm" disabled={!nextVideo} asChild={!!nextVideo}>
              {nextVideo ? (
                <Link href={`/dashboard/playlists/${id}/video/${nextVideo.id}`}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <span>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
