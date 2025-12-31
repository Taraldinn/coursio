"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Atom, Terminal, Database, Server } from "lucide-react"
import Link from "next/link"
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
    slug?: string
  }
}

export function RecentlyReleasedCard({ playlist }: RecentlyReleasedCardProps) {
  const totalDuration = playlist.videos.reduce((sum: number, v: any) => sum + (v.duration || 0), 0)

  // Randomize icon based on title length or ID to give variety if no specific category icon
  const Icons = [BookOpen, Atom, Terminal, Database, Server]
  const Icon = Icons[playlist.title.length % Icons.length]

  // Icon colors matching the design - simpler dark mode friendly
  const iconThemes = [
    { bg: "bg-blue-500", text: "text-white" },
    { bg: "bg-green-500", text: "text-white" },
    { bg: "bg-zinc-800", text: "text-white" }, // Dark GitHub-like
    { bg: "bg-orange-500", text: "text-white" },
  ]
  const theme = iconThemes[playlist.title.length % iconThemes.length]

  // Use slug if available, otherwise fallback to ID
  const linkHref = playlist.slug
    ? `/playlist/${playlist.slug}`
    : `/dashboard/playlists/${playlist.id}`

  return (
    <Link href={linkHref}>
      <Card className="group h-full bg-card/40 hover:bg-card/60 border-border/40 transition-all duration-300 hover:shadow-md cursor-pointer hover:translate-y-[-2px]">
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              {/* Icon */}
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shadow-lg ${theme.bg}`}>
                <Icon className={`h-5 w-5 ${theme.text}`} />
              </div>
              <Badge variant="secondary" className="bg-muted text-xs font-normal">
                New
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {playlist.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                {playlist.description || "Master this topic with our comprehensive guide."}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Duration: {Math.max(1, Math.round(totalDuration / 3600)) + "h"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
