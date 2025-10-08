"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PlaySquare, Clock } from "lucide-react"

interface PlaylistCardProps {
  playlist: {
    id: string
    title: string
    description: string | null
    thumbnail: string | null
    category: {
      name: string
    } | null
    videos: {
      id: string
      progress: {
        completed: boolean
      }[]
    }[]
  }
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const totalVideos = playlist.videos.length
  const completedVideos = playlist.videos.filter(
    (v) => v.progress[0]?.completed
  ).length
  const progressPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0

  return (
    <Link href={`/dashboard/playlists/${playlist.id}`}>
      <Card className="h-full transition-all hover:shadow-lg">
        <CardHeader className="space-y-2">
          {playlist.thumbnail && (
            <div className="aspect-video overflow-hidden rounded-md">
              <img
                src={playlist.thumbnail}
                alt={playlist.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold">{playlist.title}</h3>
            {playlist.category && (
              <Badge variant="secondary" className="shrink-0">
                {playlist.category.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {playlist.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {playlist.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <div className="flex w-full items-center gap-2 text-sm text-muted-foreground">
            <PlaySquare className="h-4 w-4" />
            <span>
              {completedVideos} / {totalVideos} videos completed
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardFooter>
      </Card>
    </Link>
  )
}
