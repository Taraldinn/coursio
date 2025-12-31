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
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white">
      <div className="px-4 h-16 flex items-center justify-between shrink-0 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-white/5 flex items-center justify-center border border-white/10">
            <Menu className="h-4 w-4 text-white/70" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-sm tracking-tight text-white">Contents</h3>
            <p className="text-[10px] text-white/50">Browse content</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col p-2 space-y-1">
          {videos.map((video, index) => {
            const isCurrent = video.id === currentVideoId
            const isCompleted = video.progress?.[0]?.completed || false

            return (
              <Link
                key={video.id}
                href={`/playlist/${playlistId}/watch?video=${video.id}`}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-all duration-200 border border-transparent",
                  isCurrent ? "bg-white/10 border-white/5" : "hover:bg-white/5"
                )}
              >
                {/* Status Icon */}
                <div className="mt-0.5 shrink-0">
                  {isCurrent ? (
                    <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  ) : isCompleted ? (
                    <div className="h-5 w-5 rounded-full border-2 border-green-500/50 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-white/20 flex items-center justify-center">
                      <span className="text-[9px] text-white/50 font-mono">{index + 1}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className={cn(
                    "text-sm font-medium leading-tight line-clamp-2",
                    isCurrent ? "text-white" : "text-white/70"
                  )}>
                    {index + 1}. {video.title}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-white/40">
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
