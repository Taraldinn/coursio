"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

interface LibraryCardProps {
  playlist: {
    id: string
    slug?: string | null
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
  const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0
  const firstVideo = playlist.videos[0]

  return (
    <Link href={`/playlist/${playlist.slug || playlist.id}`}>
      <Card className="group h-full bg-card/50 hover:bg-card border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/50 cursor-pointer">
        <CardContent className="p-6 flex flex-col h-full gap-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {playlist.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {firstVideo?.title || "Start your journey"}
              </p>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progressPercentage}% complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-muted/50" />
            </div>

            <Button className="w-full font-medium" size="lg" variant="secondary">
              {progressPercentage > 0 ? "Continue Learning" : "Start Learning"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
