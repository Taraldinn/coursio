"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EnhancedVideoPlayer } from "@/components/enhanced-video-player"
import { EnhancedNoteEditor } from "@/components/enhanced-note-editor"
import { CompactVideoList } from "@/components/compact-video-list"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react"

interface ResizableVideoPageProps {
  video: any
  playlistId: string
  userId: string
  currentIndex: number
  totalVideos: number
  prevVideo: any
  nextVideo: any
  userProgress: any
  userNote: any
}

export function ResizableVideoPage({
  video,
  playlistId,
  userId,
  currentIndex,
  totalVideos,
  prevVideo,
  nextVideo,
  userProgress,
  userNote,
}: ResizableVideoPageProps) {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)

  return (
    <div className="h-[calc(100vh-8rem)] space-y-3">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/playlists/${playlistId}`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Playlist
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
        >
          {leftPanelCollapsed ? (
            <>
              <Maximize2 className="mr-2 h-4 w-4" />
              Show Sidebar
            </>
          ) : (
            <>
              <Minimize2 className="mr-2 h-4 w-4" />
              Hide Sidebar
            </>
          )}
        </Button>
      </div>

      <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
        {/* Left Sidebar - Resizable */}
        {!leftPanelCollapsed && (
          <>
            <ResizablePanel
              defaultSize={25}
              minSize={15}
              maxSize={40}
            >
              <div className="flex h-full flex-col gap-3 overflow-hidden p-3">
                {/* Playlist Videos - Scrollable */}
                <div className="flex-shrink-0 rounded-lg border bg-card">
                  <CompactVideoList
                    videos={video.playlist.videos}
                    currentVideoId={video.id}
                    playlistId={playlistId}
                    userId={userId}
                  />
                </div>

                {/* Notes Editor - Scrollable */}
                <div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card p-3">
                  <h3 className="mb-2 text-sm font-semibold">Notes</h3>
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <EnhancedNoteEditor
                      videoId={video.id}
                      initialContent={userNote?.content || ""}
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {/* Right Main Content - Resizable Video */}
        <ResizablePanel defaultSize={leftPanelCollapsed ? 100 : 75} minSize={50}>
          <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
            {/* Video Player */}
            <div className="flex-shrink-0">
              <EnhancedVideoPlayer
                videoId={video.id}
                url={video.url}
                youtubeId={video.youtubeId}
                initialProgress={userProgress?.currentTime || 0}
              />
            </div>

            {/* Video Info */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">{video.title}</h1>
              {video.description && (
                <p className="mt-2 text-sm text-muted-foreground">{video.description}</p>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex-shrink-0 border-t pt-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!prevVideo}
                  asChild={!!prevVideo}
                >
                  {prevVideo ? (
                    <Link href={`/dashboard/playlists/${playlistId}/video/${prevVideo.id}`}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Link>
                  ) : (
                    <span>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </span>
                  )}
                </Button>

                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {totalVideos}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!nextVideo}
                  asChild={!!nextVideo}
                >
                  {nextVideo ? (
                    <Link href={`/dashboard/playlists/${playlistId}/video/${nextVideo.id}`}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <span>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
