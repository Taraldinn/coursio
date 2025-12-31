"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Sparkles, Play, Clock } from "lucide-react"
import Image from "next/image"
import { formatDuration } from "@/lib/playlist-utils"

interface LibraryCardProps {
  playlist: {
    id: string
    title: string
    description: string | null
    thumbnail: string | null
    category: {
      name: string
      color?: string | null
    } | null
    videos: {
      id: string
      title: string
      duration: number | null
      progress: {
        completed: boolean
      }[]
    }[]
  }
}

export function LibraryCard({ playlist }: LibraryCardProps) {
  const totalVideos = playlist.videos.length
  const completedVideos = playlist.videos.filter(
    (v) => v.progress[0]?.completed
  ).length
  const progressPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0
  const totalDuration = playlist.videos.reduce((sum, v) => sum + (v.duration || 0), 0)
  const firstVideo = playlist.videos[0]

  // Icon colors based on category or default - matching the design
  const iconColors = [
    "bg-blue-500/10 text-blue-500",
    "bg-blue-600/10 text-blue-600",
    "bg-black/10 text-black dark:bg-white/10 dark:text-white",
    "bg-orange-500/10 text-orange-500",
    "bg-green-500/10 text-green-500",
    "bg-purple-500/10 text-purple-500",
    "bg-teal-500/10 text-teal-500"
  ]
  const iconColor = iconColors[playlist.id.charCodeAt(0) % iconColors.length]

  return (
    <Link href={`/dashboard/playlists/${playlist.id}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Icon */}
            <div className="flex items-start justify-between">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${iconColor}`}>
                <Sparkles className="h-6 w-6" />
              </div>
            </div>

            {/* Title and Description */}
            <div className="space-y-1">
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                {playlist.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {firstVideo?.title || playlist.description || "No description"}
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {progressPercentage}% complete
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Duration */}
            {totalDuration > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Duration: {formatDuration(totalDuration)}</span>
              </div>
            )}

            {/* Start Learning Button */}
            <Button className="w-full" size="sm">
              <Play className="mr-2 h-4 w-4" />
              Start Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

