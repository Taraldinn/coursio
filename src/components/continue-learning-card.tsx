"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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
    slug?: string
  }
}

export function ContinueLearningCard({ playlist }: ContinueLearningCardProps) {
  const firstVideo = playlist.videos[0]
  const firstVideoTitle = firstVideo?.title || ""

  // Use slug if available, otherwise fallback to ID
  const linkHref = playlist.slug
    ? `/playlist/${playlist.slug}`
    : `/dashboard/playlists/${playlist.id}`

  return (
    <Link href={linkHref}>
      <Card className="group h-full bg-card/50 hover:bg-card border-border/50 transition-all duration-300 hover:shadow-md cursor-pointer">
        <CardContent className="p-6 flex flex-col h-full justify-between gap-6">
          <div className="flex gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {playlist.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {firstVideoTitle || playlist.description || "Continue your progress"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{playlist.progress}% complete</span>
              </div>
              <Progress value={playlist.progress} className="h-2 bg-muted/50" />
            </div>

            <Button className="w-full font-medium" size="lg" variant="secondary">
              Start Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
