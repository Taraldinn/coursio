"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { updateProgress } from "@/app/actions/progress"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    SkipBack,
    SkipForward,
    Settings,
    Subtitles,
    PictureInPicture2,
    RotateCcw,
    Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
    videoId: string
    url: string | null
    youtubeId?: string | null
    initialProgress?: number
    onEnded?: () => void
    onNext?: () => void
    onPrevious?: () => void
}

const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const qualityOptions = ['auto', '1080p', '720p', '480p', '360p', '240p', '144p']

export function VideoPlayer({
    videoId,
    url,
    youtubeId,
    initialProgress = 0,
    onEnded,
    onNext,
    onPrevious
}: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const progressInterval = useRef<NodeJS.Timeout | null>(null)
    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)
    const lastSavedRef = useRef(0)

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)
    const [quality, setQuality] = useState('auto')
    const [buffered, setBuffered] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const isYouTube = youtubeId || (url && (url.includes("youtube.com") || url.includes("youtu.be")))

    // Format time to MM:SS or HH:MM:SS
    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "0:00"
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Auto-hide controls
    const resetHideControlsTimer = useCallback(() => {
        setShowControls(true)
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current)
        }
        if (isPlaying) {
            hideControlsTimeout.current = setTimeout(() => {
                setShowControls(false)
            }, 3000)
        }
    }, [isPlaying])

    // Video event handlers
    useEffect(() => {
        const video = videoRef.current
        if (!video || isYouTube) return

        const handleLoadedMetadata = () => {
            setDuration(video.duration)
            setIsLoading(false)
            if (initialProgress > 0) {
                video.currentTime = initialProgress
            }
        }

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime)

            // Update buffered progress
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1))
            }

            // Save progress every 10 seconds
            const current = Math.floor(video.currentTime)
            if (current - lastSavedRef.current >= 10) {
                updateProgress(videoId, current, false)
                lastSavedRef.current = current
            }
        }

        const handleEnded = () => {
            setIsPlaying(false)
            updateProgress(videoId, Math.floor(video.duration), true)
            onEnded?.()
        }

        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)
        const handleWaiting = () => setIsLoading(true)
        const handleCanPlay = () => setIsLoading(false)

        video.addEventListener("loadedmetadata", handleLoadedMetadata)
        video.addEventListener("timeupdate", handleTimeUpdate)
        video.addEventListener("ended", handleEnded)
        video.addEventListener("play", handlePlay)
        video.addEventListener("pause", handlePause)
        video.addEventListener("waiting", handleWaiting)
        video.addEventListener("canplay", handleCanPlay)

        return () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata)
            video.removeEventListener("timeupdate", handleTimeUpdate)
            video.removeEventListener("ended", handleEnded)
            video.removeEventListener("play", handlePlay)
            video.removeEventListener("pause", handlePause)
            video.removeEventListener("waiting", handleWaiting)
            video.removeEventListener("canplay", handleCanPlay)
        }
    }, [videoId, initialProgress, isYouTube, onEnded])

    // Fullscreen change handler
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const video = videoRef.current
            if (!video || isYouTube) return
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault()
                    togglePlay()
                    break
                case 'f':
                    e.preventDefault()
                    toggleFullscreen()
                    break
                case 'm':
                    e.preventDefault()
                    toggleMute()
                    break
                case 'arrowleft':
                case 'j':
                    e.preventDefault()
                    skip(-10)
                    break
                case 'arrowright':
                case 'l':
                    e.preventDefault()
                    skip(10)
                    break
                case 'arrowup':
                    e.preventDefault()
                    adjustVolume(0.1)
                    break
                case 'arrowdown':
                    e.preventDefault()
                    adjustVolume(-0.1)
                    break
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    e.preventDefault()
                    video.currentTime = (parseInt(e.key) / 10) * duration
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [duration, isYouTube])

    const togglePlay = () => {
        const video = videoRef.current
        if (!video) return
        if (video.paused) {
            video.play()
        } else {
            video.pause()
        }
    }

    const toggleMute = () => {
        const video = videoRef.current
        if (!video) return
        video.muted = !video.muted
        setIsMuted(video.muted)
    }

    const adjustVolume = (delta: number) => {
        const video = videoRef.current
        if (!video) return
        const newVolume = Math.max(0, Math.min(1, volume + delta))
        video.volume = newVolume
        setVolume(newVolume)
        if (newVolume > 0 && isMuted) {
            video.muted = false
            setIsMuted(false)
        }
    }

    const handleVolumeChange = (value: number[]) => {
        const video = videoRef.current
        if (!video) return
        const newVolume = value[0]
        video.volume = newVolume
        setVolume(newVolume)
        if (newVolume > 0 && isMuted) {
            video.muted = false
            setIsMuted(false)
        }
    }

    const skip = (seconds: number) => {
        const video = videoRef.current
        if (!video) return
        video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
    }

    const handleSeek = (value: number[]) => {
        const video = videoRef.current
        if (!video) return
        video.currentTime = value[0]
        setCurrentTime(value[0])
    }

    const toggleFullscreen = async () => {
        if (!containerRef.current) return
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen()
            } else {
                await containerRef.current.requestFullscreen()
            }
        } catch (error) {
            console.error('Fullscreen error:', error)
        }
    }

    const handleSpeedChange = (speed: number) => {
        const video = videoRef.current
        if (!video) return
        video.playbackRate = speed
        setPlaybackSpeed(speed)
    }

    const togglePictureInPicture = async () => {
        const video = videoRef.current
        if (!video) return
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture()
            } else {
                await video.requestPictureInPicture()
            }
        } catch (error) {
            console.error('PiP error:', error)
        }
    }

    const restart = () => {
        const video = videoRef.current
        if (!video) return
        video.currentTime = 0
        video.play()
    }

    // YouTube embed with full controls
    if (isYouTube && youtubeId) {
        return (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?start=${Math.floor(initialProgress)}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title="Video player"
                />
            </div>
        )
    }

    // No video source
    if (!url) {
        return (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black flex items-center justify-center text-white/50">
                <div className="text-center">
                    <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No video source available</p>
                </div>
            </div>
        )
    }

    // Custom video player
    return (
        <div
            ref={containerRef}
            className={cn(
                "relative aspect-video w-full overflow-hidden rounded-lg bg-black group",
                isFullscreen && "fixed inset-0 z-50 rounded-none"
            )}
            onMouseMove={resetHideControlsTimer}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={url}
                className="h-full w-full"
                playsInline
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
            />

            {/* Loading spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            )}

            {/* Play/Pause overlay */}
            {!isPlaying && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <button
                        onClick={togglePlay}
                        className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                        <Play className="h-10 w-10 text-white fill-current ml-1" />
                    </button>
                </div>
            )}

            {/* Controls overlay */}
            <div
                className={cn(
                    "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300",
                    showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
            >
                {/* Progress bar */}
                <div className="px-4 pt-12 pb-2">
                    <div className="relative group/progress">
                        {/* Buffered progress */}
                        <div className="absolute inset-x-0 h-1 bg-white/20 rounded-full">
                            <div
                                className="h-full bg-white/40 rounded-full"
                                style={{ width: `${(buffered / duration) * 100}%` }}
                            />
                        </div>
                        <Slider
                            value={[currentTime]}
                            max={duration || 100}
                            step={0.1}
                            onValueChange={handleSeek}
                            className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-transparent [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-red-500 [&_[role=slider]]:border-0 [&>span:first-child>span]:bg-red-500 group-hover/progress:[&>span:first-child]:h-1.5 group-hover/progress:[&_[role=slider]]:h-4 group-hover/progress:[&_[role=slider]]:w-4"
                        />
                    </div>
                </div>

                {/* Bottom controls */}
                <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-1">
                        {/* Previous */}
                        {onPrevious && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={onPrevious}>
                                <SkipBack className="h-4 w-4" />
                            </Button>
                        )}

                        {/* Play/Pause */}
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/20" onClick={togglePlay}>
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                        </Button>

                        {/* Next */}
                        {onNext && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={onNext}>
                                <SkipForward className="h-4 w-4" />
                            </Button>
                        )}

                        {/* Volume */}
                        <div className="flex items-center gap-1 group/volume">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleMute}>
                                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                            <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-200">
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={1}
                                    step={0.01}
                                    onValueChange={handleVolumeChange}
                                    className="w-20 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white"
                                />
                            </div>
                        </div>

                        {/* Time */}
                        <span className="text-white text-xs ml-2 font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Restart */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={restart}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>

                        {/* Settings */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                                {playbackSpeeds.map((speed) => (
                                    <DropdownMenuItem
                                        key={speed}
                                        onClick={() => handleSpeedChange(speed)}
                                        className="flex items-center justify-between"
                                    >
                                        <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                                        {playbackSpeed === speed && <Check className="h-4 w-4" />}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Quality</DropdownMenuLabel>
                                {qualityOptions.map((q) => (
                                    <DropdownMenuItem
                                        key={q}
                                        onClick={() => setQuality(q)}
                                        className="flex items-center justify-between"
                                    >
                                        <span>{q === 'auto' ? 'Auto' : q}</span>
                                        {quality === q && <Check className="h-4 w-4" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Picture in Picture */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={togglePictureInPicture}>
                            <PictureInPicture2 className="h-4 w-4" />
                        </Button>

                        {/* Fullscreen */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleFullscreen}>
                            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
