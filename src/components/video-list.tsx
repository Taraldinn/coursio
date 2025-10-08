"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Play } from "lucide-react"

interface Video {
  id: string
  title: string
  duration: number | null
  position: number
}

interface VideoListProps {
  videos: Video[]
  currentVideoId: string
  playlistId: string
  userId: string
}

export function VideoList({ videos, currentVideoId, playlistId, userId }: VideoListProps) {
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchProgress = async () => {
      const response = await fetch(`/api/playlists/${playlistId}/progress?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProgressMap(data)
      }
    }
    fetchProgress()
  }, [playlistId, userId])

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return ""
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    
return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-1">
        {videos.map((video, index) => {
          const isActive = video.id === currentVideoId
          const isCompleted = progressMap[video.id] || false

          return (
            <Button
              key={video.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-left",
                isActive && "bg-secondary"
              )}
              asChild
            >
              <Link href={`/dashboard/playlists/${playlistId}/video/${video.id}`}>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs">
                  {isCompleted ? (
                    <Check className="h-3 w-3" />
                  ) : isActive ? (
                    <Play className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="line-clamp-2 text-sm font-medium">
                    {video.title}
                  </div>
                  {video.duration && (
                    <div className="text-xs text-muted-foreground">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>
              </Link>
            </Button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
