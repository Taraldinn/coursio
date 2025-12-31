"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, PlaySquare, Sparkles } from "lucide-react"
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
  
  // Icon colors matching the design
  const iconColors = [
    "bg-blue-500/10 text-blue-500",
    "bg-black/10 text-black dark:bg-white/10 dark:text-white",
    "bg-green-500/10 text-green-500",
  ]
  const iconColor = iconColors[playlist.id.charCodeAt(0) % iconColors.length]

  return (
    <Link href={`/dashboard/playlists/${playlist.id}`}>
      <Card className="group h-full transition-all hover:shadow-lg hover:border-primary/50">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Icon with New Badge */}
            <div className="relative">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${iconColor}`}>
                <Sparkles className="h-6 w-6" />
              </div>
              <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                New
              </Badge>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {playlist.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {playlist.description || playlist.firstVideoTitle || "Learn how to design"}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Duration: {formatDuration(totalDuration)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

