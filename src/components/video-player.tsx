"use client"

import { useEffect, useRef } from "react"
import { updateProgress } from "@/app/actions/progress"

interface VideoPlayerProps {
  videoId: string
  url: string
  youtubeId?: string | null
  initialProgress?: number
}

export function VideoPlayer({ videoId, url, youtubeId, initialProgress = 0 }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null)
  const playerInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !videoRef.current || playerInstanceRef.current) return

    const loadPlyr = async () => {
      const Plyr = (await import("plyr")).default
      await import("plyr/dist/plyr.css")

      const isYouTube = youtubeId || url.includes("youtube.com") || url.includes("youtu.be")

      const config = {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "settings",
          "fullscreen",
        ],
        youtube: isYouTube ? {
          noCookie: false,
          rel: 0,
          showinfo: 0,
        } : undefined,
      }

      let player: any

      if (isYouTube && youtubeId) {
        const container = document.createElement("div")
        container.setAttribute("data-plyr-provider", "youtube")
        container.setAttribute("data-plyr-embed-id", youtubeId)
        videoRef.current!.appendChild(container)
        player = new Plyr(container, config)
      } else {
        const video = document.createElement("video")
        video.src = url
        video.controls = true
        videoRef.current!.appendChild(video)
        player = new Plyr(video, config)
      }

      playerInstanceRef.current = player

      player.on("ready", () => {
        if (initialProgress > 0) {
          player.currentTime = initialProgress
        }
      })

      // Save progress every 10 seconds
      let lastSaved = 0
      player.on("timeupdate", () => {
        const currentTime = Math.floor(player.currentTime)
        if (currentTime - lastSaved >= 10) {
          updateProgress(videoId, currentTime, false)
          lastSaved = currentTime
        }
      })

      // Mark as completed when video ends
      player.on("ended", () => {
        updateProgress(videoId, player.duration, true)
      })
    }

    loadPlyr()

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy()
        playerInstanceRef.current = null
      }
    }
  }, [videoId, url, youtubeId, initialProgress])

  return (
    <div 
      ref={videoRef} 
      className="aspect-video w-full overflow-hidden rounded-lg bg-black"
    />
  )
}
