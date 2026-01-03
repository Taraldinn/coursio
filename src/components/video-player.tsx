"use client"

import { useRef, useEffect } from "react"
import MuxPlayer from "@mux/mux-player-react"
import { updateProgress } from "@/app/actions/progress"

interface VideoPlayerProps {
  videoId: string
  url: string | null
  youtubeId?: string | null
  initialProgress?: number
}

export function VideoPlayer({ videoId, url, youtubeId, initialProgress = 0 }: VideoPlayerProps) {
  const playerRef = useRef<any>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const lastSavedRef = useRef(0)

  useEffect(() => {
    const player = playerRef.current
    if (!player) return

    // Set initial progress when player is ready
    const handleLoadedMetadata = () => {
      if (initialProgress > 0 && player.currentTime !== undefined) {
        player.currentTime = initialProgress
      }
    }

    // Save progress every 10 seconds
    const handleTimeUpdate = () => {
      if (player.currentTime === undefined) return
      const currentTime = Math.floor(player.currentTime)
      if (currentTime - lastSavedRef.current >= 10) {
        updateProgress(videoId, currentTime, false)
        lastSavedRef.current = currentTime
      }
    }

    // Mark as completed when video ends
    const handleEnded = () => {
      if (player.duration === undefined) return
      updateProgress(videoId, Math.floor(player.duration), true)
    }

    player.addEventListener("loadedmetadata", handleLoadedMetadata)
    player.addEventListener("timeupdate", handleTimeUpdate)
    player.addEventListener("ended", handleEnded)

    return () => {
      player.removeEventListener("loadedmetadata", handleLoadedMetadata)
      player.removeEventListener("timeupdate", handleTimeUpdate)
      player.removeEventListener("ended", handleEnded)
    }
  }, [videoId, initialProgress])

  // Determine video source
  const isYouTube = youtubeId || (url && (url.includes("youtube.com") || url.includes("youtu.be")))

  if (isYouTube && youtubeId) {
    // For YouTube videos, we'll use an iframe embed
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${youtubeId}?start=${Math.floor(initialProgress)}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  // If no valid url, show placeholder
  if (!url) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black flex items-center justify-center text-white/50">
        No video source available
      </div>
    )
  }

  // For regular video URLs, use Mux Player
  return (
    <MuxPlayer
      ref={playerRef}
      src={url}
      streamType="on-demand"
      playbackId={url}
      metadata={{
        video_id: videoId,
        video_title: "Video",
      }}
      className="aspect-video w-full overflow-hidden rounded-lg"
      style={{ aspectRatio: "16/9" }}
    />
  )
}

