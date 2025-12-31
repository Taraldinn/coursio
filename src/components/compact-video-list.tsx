"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface CompactVideoListProps {
  videos: any[]
  currentVideoId: string
  playlistId: string
  userId: string
}

export function CompactVideoList({
  videos,
  currentVideoId,
  playlistId,
  userId,
}: CompactVideoListProps) {
  const [isOpen, setIsOpen] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const currentIndex = videos.findIndex((v: any) => v.id === currentVideoId)
  const completedCount = videos.filter((v: any) => v.progress?.[0]?.completed).length

  // Scroll to current video when component mounts or current video changes
  useEffect(() => {
    if (isOpen && currentIndex >= 0) {
      const timer = setTimeout(() => {
        const currentVideoElement = containerRef.current?.querySelector(
          `[data-video-id="${currentVideoId}"]`
        )
        if (currentVideoElement) {
          currentVideoElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          })
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isOpen, currentVideoId, currentIndex])

  return (
    <div className="flex flex-col">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-3 h-auto hover:bg-muted/50 border-b rounded-t-lg rounded-b-none"
          >
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="font-semibold text-sm">Videos</span>
            </div>
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {completedCount}/{videos.length}
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="overflow-hidden">
          <div className="h-[500px]">
            <ScrollArea className="h-full">
              <div ref={containerRef} className="space-y-1 p-2">
              {videos.map((video: any, index: number) => {
                const isCompleted = video.progress?.[0]?.completed || false
                const isCurrent = video.id === currentVideoId

                return (
                  <Link
                    key={video.id}
                    data-video-id={video.id}
                    href={`/dashboard/playlists/${playlistId}/video/${video.id}`}
                    className={cn(
                      "block rounded-lg transition-all duration-200",
                      isCurrent 
                        ? "bg-primary/10 border border-primary/20 shadow-sm" 
                        : "hover:bg-muted/50 border border-transparent"
                    )}
                  >
                    <div className="flex items-start gap-3 p-2.5">
                      <div className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        isCurrent 
                          ? "border-primary bg-primary/10" 
                          : isCompleted
                          ? "border-green-500/50 bg-green-500/10"
                          : "border-muted-foreground/30 bg-background"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        ) : isCurrent ? (
                          <Circle className="h-3.5 w-3.5 fill-primary text-primary" />
                        ) : (
                          <span className="text-[10px] font-medium text-muted-foreground">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className={cn(
                          "text-xs leading-snug line-clamp-2 transition-colors",
                          isCurrent 
                            ? "font-semibold text-foreground" 
                            : "font-medium",
                          isCompleted && !isCurrent && "text-muted-foreground"
                        )}>
                          {video.title}
                        </p>
                        
                        {video.duration && (
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
              </div>
            </ScrollArea>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
