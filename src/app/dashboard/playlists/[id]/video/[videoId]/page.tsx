import { redirect, notFound } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { VideoPlayer } from "@/components/video-player"
import { EnhancedNoteEditor } from "@/components/enhanced-note-editor"
import { CourseContentsSidebar } from "@/components/course-contents-sidebar"
import { NotesSidebar } from "@/components/notes-sidebar"
import { Button } from "@/components/ui/button"
import { Menu, ChevronLeft, ChevronRight, MessageSquare, FileText, Folder, Bell, Star, Bookmark, Share2, Moon } from "lucide-react"
import Link from "next/link"
import { formatDuration } from "@/lib/playlist-utils"

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

  const currentIndex = video.playlist.videos.findIndex((v: { id: string }) => v.id === video.id)
  const prevVideo = currentIndex > 0 ? video.playlist.videos[currentIndex - 1] : null
  const nextVideo = currentIndex < video.playlist.videos.length - 1 ? video.playlist.videos[currentIndex + 1] : null

  const userProgress = video.progress[0]
  const userNote = video.notes

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Sidebar - Navigation Icons */}
      <div className="w-16 border-r bg-background flex flex-col items-center py-4 gap-4">
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <FileText className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Folder className="h-5 w-5" />
        </Button>
      </div>

      {/* Left Sidebar - Course Contents */}
      <div className="w-80 border-r bg-background flex flex-col">
        <CourseContentsSidebar
          playlist={video.playlist}
          currentVideoId={video.id}
          playlistId={id}
          userId={user.id}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b bg-background flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <h1 className="text-sm font-medium truncate">
                {video.playlist.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Star className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Moon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Video Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-6">
            {/* Video Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatDuration(video.duration || 0)}</span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">Video</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Ask AI</Button>
                <Button variant="outline" size="sm">Notes</Button>
              </div>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <VideoPlayer
                videoId={video.id}
                url={video.url}
                youtubeId={video.youtubeId}
                initialProgress={userProgress?.watchedDuration || 0}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                👍 Helpful
              </Button>
              <Button variant="outline" size="sm">
                💬 Discuss
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Notes */}
      <div className="w-96 border-l bg-background flex flex-col">
        <NotesSidebar
          videos={video.playlist.videos.map((v) => ({
            id: v.id,
            title: v.title,
            notes: v.notes,
            updatedAt: v.updatedAt,
            position: v.position,
          }))}
          currentVideoId={video.id}
          onNoteSave={async () => { }}
          onVideoSelect={() => { }}
        />
      </div>
    </div>
  )
}
