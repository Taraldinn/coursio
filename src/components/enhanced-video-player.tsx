"use client"

import { useEffect, useRef, useState } from "react"
import { updateProgress } from "@/app/actions/progress"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [buffered, setBuffered] = useState(0)
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)

  const isYouTube = youtubeId || url.includes("youtube.com") || url.includes("youtu.be")

  useEffect(() => {
    const video = videoRef.current
    if (!video || isYouTube) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      if (initialProgress > 0) {
        video.currentTime = initialProgress
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      
      // Auto-save progress every 10 seconds
      if (Math.floor(video.currentTime) % 10 === 0) {
        updateProgress(videoId, Math.floor(video.currentTime), false)
      }
    }

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const percentage = (bufferedEnd / video.duration) * 100
        setBuffered(percentage)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      updateProgress(videoId, video.duration, true)
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("progress", handleProgress)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("progress", handleProgress)
      video.removeEventListener("ended", handleEnded)
    }
  }, [videoId, initialProgress, isYouTube])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return
    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = rate
    setPlaybackRate(rate)
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    
return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current)
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  if (isYouTube) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?start=${Math.floor(initialProgress)}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-lg bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={url}
        className="h-full w-full"
        onClick={togglePlay}
      />

      {/* Buffering Progress */}
      <div className="absolute bottom-16 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-white/40"
          style={{ width: `${buffered}%` }}
        />
      </div>

      {/* Controls */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-3">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="mt-1 flex justify-between text-xs text-white">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            {/* Skip Back */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(-10)}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {/* Skip Forward */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(10)}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Playback Speed */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-white hover:bg-white/20"
                >
                  <Settings className="mr-1 h-4 w-4" />
                  {playbackRate}x
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                  <DropdownMenuItem
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={playbackRate === rate ? "bg-accent" : ""}
                  >
                    {rate}x {rate === 1 && "(Normal)"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Center Play Button Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="h-20 w-20 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <Play className="h-10 w-10" />
          </Button>
        </div>
      )}
    </div>
  )
}
