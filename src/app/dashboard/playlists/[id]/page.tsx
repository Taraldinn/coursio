import { currentUser } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlaySquare, Clock, CheckCircle2, ArrowLeft } from "lucide-react"
import { PlaylistSync } from "@/components/playlist-sync"
import { cn } from "@/lib/utils"

interface PlaylistPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const user = await currentUser()

  if (!user?.id) {
    redirect("/sign-in")
  }

  const { id } = await params

  const playlist = await prisma.playlist.findUnique({
    where: {
      id,
    },
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
      category: true,
    },
  })

  if (!playlist) {
    notFound()
  }

  const totalVideos = playlist.videos.length
  const completedVideos = playlist.videos.filter((v: any) => v.progress[0]?.completed).length
  const progressPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const hours = Math.floor(mins / 60)
    if (hours > 0) {
      return `${hours}h ${mins % 60}m`
    }
    
return `${mins}m`
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header with Back and Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/playlists">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{playlist.title}</h1>
        </div>
        
        {playlist.youtubePlaylistId && (
          <PlaylistSync 
            playlistId={playlist.id}
            youtubePlaylistId={playlist.youtubePlaylistId}
            autoSync={playlist.autoSync || false}
            lastSyncedAt={playlist.lastSyncedAt}
          />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-none bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <PlaySquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVideos}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedVideos}</div>
            <Progress value={progressPercentage} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(playlist.videos.reduce((sum: number, v: { duration: number | null }) => sum + (v.duration || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Content */}
      <Card className="border-none shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Course Content</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {completedVideos} of {totalVideos} videos completed
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden p-0">
          <div className="h-[600px]">
            <ScrollArea className="h-full">
              <div className="space-y-0.5 p-4">
              {playlist.videos.map((video: any, index: number) => {
                const isCompleted = video.progress[0]?.completed || false
                
                return (
                  <Button
                    key={video.id}
                    variant="ghost"
                    className="h-auto w-full justify-start gap-3 p-3 text-left hover:bg-muted/50 rounded-md transition-colors"
                    asChild
                  >
                    <Link href={`/dashboard/playlists/${id}/video/${video.id}`} className="flex items-start gap-3 w-full min-w-0">
                      <div className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors text-xs font-medium",
                        isCompleted
                          ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
                          : "border-muted-foreground/30 bg-background text-muted-foreground"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1 overflow-hidden">
                        <div className="font-medium text-sm leading-snug line-clamp-2 break-words">{video.title}</div>
                        {video.description && (
                          <div className="text-xs text-muted-foreground break-words line-clamp-2 whitespace-pre-wrap">
                            {video.description}
                          </div>
                        )}
                      </div>
                      {video.duration && (
                        <div className="text-xs text-muted-foreground shrink-0 ml-2">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                    </Link>
                  </Button>
                )
              })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
