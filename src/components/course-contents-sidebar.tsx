"use client"

import { useState } from "react"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Video, FileText, Radio } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/playlist-utils"

interface CourseContentsSidebarProps {
  playlist: {
    id: string
    title: string
      videos: {
        id: string
        title: string
        duration: number | null
        position: number
        progress: {
          completed: boolean
        }[]
      }[]
  }
  currentVideoId: string
  playlistId: string
  userId: string
}

export function CourseContentsSidebar({
  playlist,
  currentVideoId,
  playlistId,
  userId
}: CourseContentsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  // Group videos by sections (for now, just show all videos)
  // In the future, you could group by modules/chapters
  const videos = playlist.videos

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm mb-1">Contents</h3>
        <p className="text-xs text-muted-foreground">Browse the course contents</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {videos.map((video, index) => {
            const isCurrent = video.id === currentVideoId
            const isCompleted = video.progress?.[0]?.completed || false

            return (
              <Link
                key={video.id}
                href={`/dashboard/playlists/${playlistId}/video/${video.id}`}
                className={cn(
                  "block rounded-md transition-colors",
                  isCurrent && "bg-muted"
                )}
              >
                <div className={cn(
                  "flex items-start gap-3 p-3 hover:bg-muted/50 rounded-md",
                  isCurrent && "bg-muted"
                )}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : isCurrent ? (
                        <Circle className="h-4 w-4 fill-primary text-primary" />
                      ) : (
                        <Radio className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Video className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">Video</span>
                        {video.duration && (
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(video.duration)}
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm leading-tight line-clamp-2",
                        isCurrent && "font-semibold"
                      )}>
                        {video.title}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

