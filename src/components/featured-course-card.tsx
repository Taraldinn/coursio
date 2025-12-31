"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import Image from "next/image"
import { formatDuration } from "@/lib/playlist-utils"

interface FeaturedCourseCardProps {
  playlist: {
    id: string
    slug?: string | null
    title: string
    description: string | null
    thumbnail: string | null
    coverImageUrl: string | null
    tags: string[]
    videos: {
      duration: number | null
    }[]
  }
}

export function FeaturedCourseCard({ playlist }: FeaturedCourseCardProps) {
  const totalDuration = playlist.videos.reduce(
    (sum: number, v: any) => sum + (v.duration || 0),
    0
  )
  const imageUrl = playlist.coverImageUrl || playlist.thumbnail

  return (
    <Link href={`/playlist/${playlist.slug || playlist.id}`}>
      <Card className="group w-[320px] flex-shrink-0 transition-all hover:shadow-lg hover:border-primary/50">
        <CardContent className="p-0">
          <div className="relative aspect-video overflow-hidden rounded-t-lg">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={playlist.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/5">
                <Sparkles className="h-16 w-16 text-primary/50" />
              </div>
            )}
          </div>
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {playlist.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDuration(totalDuration)}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {playlist.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

