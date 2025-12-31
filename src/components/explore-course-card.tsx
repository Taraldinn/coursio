"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Sparkles, Database, Layers, Code, Bookmark } from "lucide-react"
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
  const isPremium = playlist.visibility === "PUBLIC" // Assuming public for now, logic can change

  return (
    <Card className="group transition-all hover:bg-white/5 border-border/40 bg-card/40 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Thumbnail */}
          <div className="relative w-[280px] h-[160px] flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 shadow-inner">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={playlist.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
                <Code className="h-8 w-8 text-primary/50" />
                <span className="text-xs text-muted-foreground font-mono bg-black/50 px-2 py-1 rounded">
                  {playlist.title.substring(0, 15)}...
                </span>
              </div>
            )}
            {isNew && (
              <div className="absolute top-2 right-2">
                <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white border-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                  New
                </Badge>
              </div>
            )}
            {/* Overlay gradients if no image to make it look cool */}
            {!imageUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-bold tracking-wider rounded-sm h-5 px-1.5 border-0",
                    isPremium ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {isPremium ? "PREMIUM" : "FREE"}
                  </Badge>
                </div>
                <Link href={`/playlist/${playlist.slug || playlist.id}`}>
                  <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                    {playlist.title}
                  </h3>
                </Link>
                {playlist.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {playlist.description}
                  </p>
                )}
              </div>

              {playlist.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {playlist.tags.slice(0, 4).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] bg-muted hover:bg-muted/80 text-muted-foreground border-0 px-2 rounded-md"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {playlist.difficulty && (
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    <span className="capitalize">{playlist.difficulty.toLowerCase()}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{Math.round(totalDuration / 60 / 60)}h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5" />
                  <span>{playlist._count.videos} projects</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs font-medium px-4 bg-muted hover:bg-muted/80 text-foreground border border-border/50"
                  asChild
                >
                  <Link href={`/playlist/${playlist.slug || playlist.id}`}>
                    Quick View
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
