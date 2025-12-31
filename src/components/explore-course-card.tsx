"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Sparkles } from "lucide-react"
import Image from "next/image"
import { formatDuration } from "@/lib/playlist-utils"
import { cn } from "@/lib/utils"

interface ExploreCourseCardProps {
  playlist: {
    id: string
    slug?: string | null
    title: string
    description: string | null
    thumbnail: string | null
    coverImageUrl: string | null
    tags: string[]
    difficulty: string | null
    visibility: string
    createdAt: string
    videos: {
      duration: number | null
    }[]
    _count: {
      videos: number
    }
  }
  userId: string
}

export function ExploreCourseCard({ playlist, userId }: ExploreCourseCardProps) {
  const totalDuration = playlist.videos.reduce(
    (sum: number, v: any) => sum + (v.duration || 0),
    0
  )
  const imageUrl = playlist.coverImageUrl || playlist.thumbnail
  const isNew = new Date(playlist.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const isPremium = playlist.visibility === "PUBLIC" && playlist.difficulty === "ADVANCED"

  const difficultyColors = {
    BEGINNER: "bg-green-500/10 text-green-600 dark:text-green-400",
    INTERMEDIATE: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    ADVANCED: "bg-red-500/10 text-red-600 dark:text-red-400"
  }

  return (
    <Link href={`/playlist/${playlist.slug || playlist.id}`}>
      <Card className="group transition-all hover:shadow-lg hover:border-primary/50">
        <CardContent className="p-4">
          <div className="flex gap-4 items-start">
            {/* Thumbnail */}
            <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={playlist.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Header with badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {isPremium ? (
                    <Badge className="bg-primary text-primary-foreground text-xs font-medium">PREMIUM</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs font-medium">FREE</Badge>
                  )}
                  {isNew && (
                    <Badge variant="secondary" className="text-xs font-medium">NEW</Badge>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="shrink-0"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // Handle quick view - could open a modal or navigate
                    window.location.href = `/playlist/${playlist.slug || playlist.id}`
                  }}
                >
                  Quick View
                </Button>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {playlist.title}
              </h3>

              {/* Tags */}
              {playlist.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {playlist.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs text-muted-foreground"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Meta Info */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                {playlist.difficulty && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      difficultyColors[playlist.difficulty as keyof typeof difficultyColors]
                    )}
                  >
                    {playlist.difficulty}
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(totalDuration)}</span>
                </div>
                <span>{playlist._count.videos} {playlist._count.videos === 1 ? "video" : "videos"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

