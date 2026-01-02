"use client"

import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/playlist-utils"
import { Play, CheckCircle2, Lock, FileText, Video, Radio, Menu } from "lucide-react"
import { Button } from "./ui/button"

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
    <div className="flex flex-col h-full bg-transparent text-white">
      <ScrollArea className="flex-1">
        <div className="flex flex-col p-3 space-y-2">
          {videos.map((video, index) => {
            const isCurrent = video.id === currentVideoId
            const isCompleted = video.progress?.[0]?.completed || false

            return (
              <Link
                key={video.id}
                href={`/playlist/${playlistId}/watch?video=${video.id}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 border group",
                  isCurrent
                    ? "bg-[#1A1A1A] border-white/10 shadow-sm"
                    : "bg-black/20 border-transparent hover:bg-white/5 hover:border-white/5"
                )}
              >
                {/* Status Icon */}
                <div className="shrink-0">
                  {isCurrent ? (
                    <div className="h-6 w-6 rounded-full bg-white text-black flex items-center justify-center shadow-lg shadow-white/10">
                      <Play className="h-3 w-3 fill-current ml-0.5" />
                    </div>
                  ) : isCompleted ? (
                    <div className="h-6 w-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-white/20 group-hover:bg-white/10 transition">
                      <span className="text-[10px] text-white/40 font-mono group-hover:text-white/60">{index + 1}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className={cn(
                    "text-xs font-medium leading-tight line-clamp-2",
                    isCurrent ? "text-white" : "text-white/60 group-hover:text-white/80"
                  )}>
                    {video.title}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-white/30 group-hover:text-white/40">
                    <span>Video</span>
                    {video.duration && (
                      <>
                        <span>•</span>
                        <span>{formatDuration(video.duration)}</span>
                      </>
                    )}
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
