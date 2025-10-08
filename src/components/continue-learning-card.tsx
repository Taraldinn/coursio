"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"

interface ContinueLearningCardProps {
  playlist: {
    id: string
    title: string
    description: string
    thumbnail: string | null
    category?: { name: string } | null
    videos: any[]
    completedCount: number
    totalCount: number
    progress: number
  }
}

export function ContinueLearningCard({ playlist }: ContinueLearningCardProps) {
  return (
    <Link href={`/dashboard/playlists/${playlist.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
        <CardContent className="p-0">
          <div className="flex gap-4 p-4">
            {/* Thumbnail */}
            <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              {playlist.thumbnail ? (
                <Image
                  src={playlist.thumbnail}
                  alt={playlist.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {playlist.title}
                  </h3>
                  {playlist.category && (
                    <Badge variant="secondary" className="flex-shrink-0 text-xs">
                      {playlist.category.name}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {playlist.description || "No description"}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {playlist.completedCount} of {playlist.totalCount} videos
                    </span>
                    <span className="font-medium">{playlist.progress}%</span>
                  </div>
                  <Progress value={playlist.progress} className="h-1.5" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
