"use client"

import { useRef } from "react"
import { MediaPlayer, MediaProvider } from '@vidstack/react'
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default'
import '@vidstack/react/player/styles/base.css'
import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'
import { updateProgress } from "@/app/actions/progress"

interface EnhancedVideoPlayerProps {
  videoId: string
  url: string
  youtubeId?: string | null
  initialProgress?: number
}

export function EnhancedVideoPlayer({
  videoId,
  url,
  youtubeId,
  initialProgress = 0,
}: EnhancedVideoPlayerProps) {
  const playerRef = useRef<any>(null)
  const lastProgressUpdate = useRef(0)

  const isYouTube = youtubeId || url.includes("youtube.com") || url.includes("youtu.be")
  const videoUrl = isYouTube ? `youtube/${youtubeId}` : url

  const handleTimeUpdate = (time: number) => {
    // Auto-save progress every 10 seconds
    if (Math.floor(time) % 10 === 0 && Math.floor(time) !== lastProgressUpdate.current) {
      lastProgressUpdate.current = Math.floor(time)
      updateProgress(videoId, Math.floor(time), false)
    }
  }

  const handleEnded = () => {
    if (playerRef.current) {
      const duration = playerRef.current.duration
      updateProgress(videoId, duration, true)
    }
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <MediaPlayer
        ref={playerRef}
        title="Course Video"
        src={videoUrl}
        viewType="video"
        streamType="on-demand"
        logLevel="warn"
        playsInline
        crossOrigin
        storage="course-video-player"
        onTimeUpdate={(event) => handleTimeUpdate(event.currentTime)}
        onEnded={handleEnded}
        onLoadedMetadata={() => {
          if (playerRef.current && initialProgress > 0) {
            playerRef.current.currentTime = initialProgress
          }
        }}
        onCanPlay={() => {
          // Video is ready to play
          if (playerRef.current && initialProgress > 0) {
            playerRef.current.currentTime = initialProgress
          }
        }}
      >
        <MediaProvider />
        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          thumbnails={isYouTube ? undefined : url.replace(/\.[^/.]+$/, '-thumbnails.vtt')}
          colorScheme="default"
          slots={{
            settingsMenuItems: {
              quality: true,
              speed: true,
              captions: true,
            },
          }}
        />
      </MediaPlayer>
    </div>
  )
}
