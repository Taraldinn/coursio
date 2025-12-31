"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, PlaySquare } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDuration } from "@/lib/playlist-utils"

interface RecentlyReleasedCardProps {
  playlist: {
    id: string
    title: string
    description: string | null
    thumbnail: string | null
    category?: { name: string } | null
    videos: any[]
    completedCount: number
    totalCount: number
    progress: number
    firstVideoTitle?: string
  }
}

export function RecentlyReleasedCard({ playlist }: RecentlyReleasedCardProps) {
  const totalDuration = playlist.videos.reduce((sum: number, v: any) => sum + (v.duration || 0), 0)

  return (
    <Link href={`/dashboard/playlists/${playlist.id}`}>
      <Card className="group h-full transition-all hover:shadow-lg hover:border-primary/50">
        <CardContent className="p-0">
          <div className="relative">
            {playlist.thumbnail ? (
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <Image
                  src={playlist.thumbnail}
                  alt={playlist.title}
                  width={400}
                  height={225}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center bg-muted rounded-t-lg">
                <PlaySquare className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
              New
            </Badge>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {playlist.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {playlist.description || playlist.firstVideoTitle || "No description"}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Duration: {formatDuration(totalDuration)}</span>
              </div>
            </div>
            
            {playlist.progress > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {playlist.completedCount} of {playlist.totalCount} videos
                  </span>
                  <span className="font-medium">{playlist.progress}%</span>
                </div>
                <Progress value={playlist.progress} className="h-1.5" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

