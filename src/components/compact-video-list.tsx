"use client"

import { useState } from "react"
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

  return (
    <div className="space-y-1">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto hover:bg-muted/50">
            <div className="flex items-center gap-1.5">
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              <span className="font-semibold text-xs">Videos</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {completedCount}/{videos.length}
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="space-y-0.5 p-1">
              {videos.map((video: any, index: number) => {
                const isCompleted = video.progress?.[0]?.completed || false
                const isCurrent = video.id === currentVideoId

                return (
                  <Link
                    key={video.id}
                    href={`/dashboard/playlists/${playlistId}/video/${video.id}`}
                    className={cn(
                      "block rounded-md transition-colors",
                      isCurrent && "bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-2 p-2 hover:bg-muted/50">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background border text-xs">
                        {isCompleted ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500\" />
                        ) : isCurrent ? (
                          <Circle className="h-3 w-3 fill-primary text-primary" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className={cn(
                          "text-xs leading-tight line-clamp-2",
                          isCurrent ? "font-semibold" : "font-medium",
                          isCompleted && !isCurrent && "text-muted-foreground"
                        )}>
                          {video.title}
                        </p>
                        
                        {video.duration && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
