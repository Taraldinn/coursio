"use client"

import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/playlist-utils"
import { Play, CheckCircle2, Lock, FileText, Video } from "lucide-react"

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
  const videos = playlist.videos

  return (
    <div className="flex flex-col h-full bg-black/20">
      <div className="p-4 border-b border-border/40 bg-card/10 h-14 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <h3 className="font-bold text-sm tracking-tight">Contents</h3>
          <p className="text-[10px] text-muted-foreground">Browse course contents</p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {videos.map((video, index) => {
            const isCurrent = video.id === currentVideoId
            const isCompleted = video.progress?.[0]?.completed || false

            return (
              <Link
                key={video.id}
                href={`/playlist/${playlistId}/watch?video=${video.id}`}
                className={cn(
                  "flex relative group transition-all duration-200 border-b border-border/20 last:border-0",
                  isCurrent ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-white/5 border-l-2 border-l-transparent"
                )}
              >
                <div className="flex-1 p-4 flex gap-3 min-w-0">
                  {/* Status Icon */}
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : isCurrent ? (
                      <div className="h-4 w-4 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/25">
                        <Play className="h-2 w-2 text-primary-foreground ml-0.5" />
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[9px] text-muted-foreground font-mono">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className={cn(
                      "text-sm font-medium leading-normal line-clamp-2 transition-colors",
                      isCurrent ? "text-primary" : "text-foreground/80 group-hover:text-foreground"
                    )}>
                      {video.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        Video
                      </span>
                      <span>•</span>
                      <span>{video.duration ? formatDuration(video.duration) : "00:00"}</span>
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
