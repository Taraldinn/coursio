import { currentUser } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlaySquare, Clock, CheckCircle2, ArrowLeft } from "lucide-react"
import { PlaylistSync } from "@/components/playlist-sync"

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/playlists">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{playlist.title}</h1>
              {playlist.category && (
                <Badge variant="secondary" className="text-xs">{playlist.category.name}</Badge>
              )}
            </div>
            {playlist.description && (
              <p className="text-sm text-muted-foreground mt-1">{playlist.description}</p>
            )}
          </div>
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

      <div className="grid gap-3 md:grid-cols-3">
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
            <Progress value={progressPercentage} className="mt-2" />
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

      <Card className="border-none shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Course Content</CardTitle>
          <CardDescription className="text-xs">
            {completedVideos} of {totalVideos} videos completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {playlist.videos.map((video: any, index: number) => {
              const isCompleted = video.progress[0]?.completed || false
              return (
                <Button
                  key={video.id}
                  variant="ghost"
                  className="h-auto w-full justify-start gap-3 p-3 text-left hover:bg-muted/50"
                  asChild
                >
                  <Link href={`/dashboard/playlists/${id}/video/${video.id}`}>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-background">
                      {isCompleted ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="font-medium text-sm">{video.title}</div>
                      {video.description && (
                        <div className="line-clamp-1 text-xs text-muted-foreground">
                          {video.description}
                        </div>
                      )}
                    </div>
                    {video.duration && (
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </Link>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
