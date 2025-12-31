"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, PlayCircle } from "lucide-react"
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

  // Deterministic gradient based on ID
  const gradients = [
    "from-blue-600/80 to-purple-900/80",
    "from-emerald-600/80 to-teal-900/80",
    "from-orange-600/80 to-red-900/80",
    "from-pink-600/80 to-rose-900/80"
  ]
  const gradient = gradients[playlist.title.length % gradients.length]

  return (
    <Link href={`/playlist/${playlist.slug || playlist.id}`}>
      <Card className="group w-[400px] h-[240px] flex-shrink-0 transition-all hover:scale-[1.01] border-0 overflow-hidden relative rounded-xl">
        {/* Background Image/Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} z-0`} />
        {playlist.coverImageUrl && (
          <img src={playlist.coverImageUrl} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 z-0" alt="" />
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/20 backdrop-blur-sm">
          <div className="bg-white/20 p-3 rounded-full backdrop-blur-md">
            <PlayCircle className="h-10 w-10 text-white" />
          </div>
        </div>

        <CardContent className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {playlist.tags.slice(0, 3).map(tag => (
                <Badge key={tag} className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs backdrop-blur-md">
                  {tag}
                </Badge>
              ))}
              <Badge className="bg-black/40 hover:bg-black/50 text-white border-0 text-xs backdrop-blur-md">
                {formatDuration(totalDuration)}
              </Badge>
            </div>

            <h3 className="font-bold text-2xl leading-tight text-shadow-sm">
              {playlist.title}
            </h3>

            <p className="text-sm text-white/80 line-clamp-2">
              {playlist.description || "Master advanced concepts with this comprehensive course."}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
