import { redirect, notFound } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { VideoPlayer } from "@/components/video-player"
import { EnhancedNoteEditor } from "@/components/enhanced-note-editor"
import { CompactVideoList } from "@/components/compact-video-list"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { CollapsibleNotes } from "@/components/collapsible-notes"

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

  const currentIndex = video.playlist.videos.findIndex((v: { id: string }) => v.id === video.id)
  const prevVideo = currentIndex > 0 ? video.playlist.videos[currentIndex - 1] : null
  const nextVideo = currentIndex < video.playlist.videos.length - 1 ? video.playlist.videos[currentIndex + 1] : null

  const userProgress = video.progress[0]
  // notes is a string field on the video, not a relation
  const userNote = video.notes

  return (
    <div className="h-full space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/playlists/${id}`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Playlist
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left Main Content - Video */}
        <div className="space-y-4">
          <div className="space-y-4">
            <VideoPlayer
              videoId={video.id}
              url={video.url}
              youtubeId={video.youtubeId}
              initialProgress={userProgress?.watchedDuration || 0}
            />
            <div>
              <h1 className="text-2xl font-bold">{video.title}</h1>
              {video.description && (
                <p className="mt-3 text-sm text-muted-foreground">{video.description}</p>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between rounded-lg border bg-card p-4">
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

            <span className="text-sm font-medium text-muted-foreground">
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

        {/* Right Sidebar - Notes & Playlist */}
        <div className="flex flex-col gap-6">
          {/* Collapsible Notes Editor */}
          <CollapsibleNotes 
            videoId={video.id} 
            initialContent={userNote || ""} 
          />

          {/* Compact Playlist Dropdown */}
          <div className="rounded-lg border bg-card shadow-sm">
            <CompactVideoList
              videos={video.playlist.videos}
              currentVideoId={video.id}
              playlistId={id}
              userId={user.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
