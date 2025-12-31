"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Sparkles, Play } from "lucide-react"

interface ContinueLearningCardProps {
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
  }
}

export function ContinueLearningCard({ playlist }: ContinueLearningCardProps) {
  const firstVideo = playlist.videos[0]
  const firstVideoTitle = firstVideo?.title || ""

  return (
    <Link href={`/dashboard/playlists/${playlist.id}`}>
      <Card className="group h-full transition-all hover:shadow-lg hover:border-primary/50">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {playlist.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {firstVideoTitle || playlist.description || "No description"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {playlist.progress}% complete
                  </span>
                </div>
                <Progress value={playlist.progress} className="h-2" />
              </div>

              <Button className="w-full" size="sm">
                <Play className="mr-2 h-4 w-4" />
                Start Learning
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
