"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
    Menu,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    FileText,
    Folder,
    ArrowLeft,
    PanelLeftClose,
    Save,
    PlayCircle,
    CheckCircle2,
    Circle,
    X,
    ThumbsUp,
    Star,
    Share2,
    Bookmark,
    Moon,
    Sun,
    Sparkles,
    Search,
    Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { EnhancedVideoPlayer } from '@/components/enhanced-video-player'
import { extractYouTubeVideoId } from '@/lib/youtube'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from 'sonner'

interface WatchPageClientProps {
    playlist: any
    currentVideo: any
    slug: string
    userId: string
}

type LeftPanel = "content" | "discussion" | "notes-list" | "resources" | null

export function WatchPageClient({
    playlist,
    currentVideo,
    slug,
    userId
}: WatchPageClientProps) {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [leftPanel, setLeftPanel] = useState<LeftPanel>("content")
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)
    const [isRightOpen, setIsRightOpen] = useState(false)
    const [noteContent, setNoteContent] = useState(currentVideo.notes || "")
    const [isSaving, setIsSaving] = useState(false)

    // View mode: 'video' or 'notes'
    const [viewMode, setViewMode] = useState<'video' | 'notes'>('video')
    const [selectedNoteVideo, setSelectedNoteVideo] = useState<any>(null)

    const currentIndex = playlist.videos.findIndex((v: any) => v.id === currentVideo.id)
    const prevVideo = currentIndex > 0 ? playlist.videos[currentIndex - 1] : null
    const nextVideo = currentIndex < playlist.videos.length - 1 ? playlist.videos[currentIndex + 1] : null

    const handleSaveNote = async () => {
        setIsSaving(true)
        try {
            const response = await fetch(`/api/videos/${currentVideo.id}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: noteContent }),
            })
            if (!response.ok) throw new Error("Failed to save")
            toast.success("Note saved!")
        } catch (error) {
            toast.error("Failed to save note")
        } finally {
            setIsSaving(false)
        }
    }

    const toggleLeftPanel = (panel: LeftPanel) => {
        if (leftPanel === panel && !isLeftCollapsed) {
            setIsLeftCollapsed(true)
        } else {
            setLeftPanel(panel)
            setIsLeftCollapsed(false)
        }
    }

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    // Calculate completion percentage
    const completedCount = playlist.videos.filter((v: any) => v.progress?.[0]?.completed).length
    const totalCount = playlist.videos.length
    const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    // Auto-save notes with debounce
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (viewMode !== 'notes' || !selectedNoteVideo) return

        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        // Debounce save by 1 second
        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true)
            try {
                const videoId = selectedNoteVideo?.id || currentVideo.id
                const response = await fetch(`/api/videos/${videoId}/notes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ notes: noteContent }),
                })
                if (!response.ok) throw new Error("Failed to save")
            } catch (error) {
                console.error("Auto-save failed:", error)
            } finally {
                setIsSaving(false)
            }
        }, 1000)

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [noteContent, viewMode, selectedNoteVideo, currentVideo.id])

    return (
        <TooltipProvider>
            <div className="flex h-screen overflow-hidden bg-[#0A0A0A] text-white">
                {/* Left Icon Navbar */}
                <div className="w-14 border-r border-white/10 bg-[#0A0A0A] flex flex-col items-center py-4 gap-1 shrink-0">

                    {/* Contents */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-10 w-10 text-white/60 hover:text-white hover:bg-white/10",
                                    leftPanel === "content" && !isLeftCollapsed && "bg-white/10 text-white"
                                )}
                                onClick={() => toggleLeftPanel("content")}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Contents</TooltipContent>
                    </Tooltip>

                    {/* Discussion */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-10 w-10 text-white/60 hover:text-white hover:bg-white/10",
                                    leftPanel === "discussion" && !isLeftCollapsed && "bg-white/10 text-white"
                                )}
                                onClick={() => toggleLeftPanel("discussion")}
                            >
                                <MessageSquare className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Discussion</TooltipContent>
                    </Tooltip>

                    {/* Notes */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-10 w-10 text-white/60 hover:text-white hover:bg-white/10",
                                    leftPanel === "notes-list" && !isLeftCollapsed && "bg-white/10 text-white"
                                )}
                                onClick={() => toggleLeftPanel("notes-list")}
                            >
                                <FileText className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Notes</TooltipContent>
                    </Tooltip>

                    {/* Resources */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-10 w-10 text-white/60 hover:text-white hover:bg-white/10",
                                    leftPanel === "resources" && !isLeftCollapsed && "bg-white/10 text-white"
                                )}
                                onClick={() => toggleLeftPanel("resources")}
                            >
                                <Folder className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Resources</TooltipContent>
                    </Tooltip>
                </div>

                {/* Left Panel Content (Collapsible Drawer) */}
                <div
                    className={cn(
                        "border-r border-white/10 bg-[#0F0F0F] flex flex-col transition-all duration-300 overflow-hidden",
                        isLeftCollapsed ? "w-0" : "w-80"
                    )}
                >
                    {leftPanel === "content" && (
                        <>
                            <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded bg-white/10">
                                        <Menu className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-semibold">Contents</span>
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-2 space-y-1">
                                    {playlist.videos.map((v: any, idx: number) => {
                                        const isCompleted = v.progress?.[0]?.completed
                                        const isCurrent = v.id === currentVideo.id
                                        return (
                                            <button
                                                key={v.id}
                                                onClick={() => {
                                                    setViewMode('video')
                                                    router.push(`/playlist/${slug}/watch?video=${v.id}`)
                                                }}
                                                className={cn(
                                                    "w-full flex items-start gap-3 p-3 rounded-xl transition-all group text-left",
                                                    "hover:bg-white/5 border border-transparent",
                                                    isCurrent && viewMode === 'video' && "bg-white/10 border-white/10"
                                                )}
                                            >
                                                <div className="shrink-0 mt-0.5">
                                                    {isCompleted ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    ) : isCurrent ? (
                                                        <PlayCircle className="h-5 w-5 text-primary" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-white/30" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        "text-sm font-medium truncate leading-tight",
                                                        isCurrent ? "text-white" : "text-white/70"
                                                    )}>
                                                        {idx + 1}. {v.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                                                            Video
                                                        </span>
                                                        <span className="text-[10px] text-white/40">
                                                            {formatDuration(v.duration || 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </>
                    )}

                    {leftPanel === "discussion" && (
                        <>
                            <div className="h-14 flex items-center px-4 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded bg-white/10">
                                        <MessageSquare className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-semibold">Discussion</span>
                                </div>
                            </div>
                            <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
                                Coming soon...
                            </div>
                        </>
                    )}

                    {leftPanel === "notes-list" && (
                        <>
                            <div className="h-14 flex items-center px-4 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded bg-white/10">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-semibold">Notes</span>
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-2 space-y-1">
                                    {playlist.videos.map((v: any, idx: number) => {
                                        const hasNotes = v.notes && v.notes.length > 0
                                        const isCurrent = v.id === currentVideo.id
                                        return (
                                            <button
                                                key={v.id}
                                                onClick={() => {
                                                    setSelectedNoteVideo(v)
                                                    setNoteContent(v.notes || "")
                                                    setViewMode('notes')
                                                }}
                                                className={cn(
                                                    "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all",
                                                    "hover:bg-white/5 border border-transparent",
                                                    (viewMode === 'notes' && selectedNoteVideo?.id === v.id) && "bg-white/10 border-white/10"
                                                )}
                                            >
                                                <div className="shrink-0 mt-0.5">
                                                    <FileText className={cn(
                                                        "h-5 w-5",
                                                        hasNotes ? "text-yellow-500" : "text-white/30"
                                                    )} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate text-white/70">
                                                        {idx + 1}. {v.title}
                                                    </p>
                                                    <p className="text-[10px] text-white/40 truncate mt-1">
                                                        {hasNotes ? v.notes?.slice(0, 50) + "..." : "No notes yet"}
                                                    </p>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </>
                    )}

                    {leftPanel === "resources" && (
                        <>
                            <div className="h-14 flex items-center px-4 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded bg-white/10">
                                        <Folder className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-semibold">Resources</span>
                                </div>
                            </div>
                            <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
                                No resources available
                            </div>
                        </>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar */}
                    <div className="h-14 border-b border-white/10 bg-[#0A0A0A] flex items-center justify-between px-4 shrink-0">
                        {/* Left side: Back, Sidebar Toggle, Title */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Back Arrow */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                                        onClick={() => router.push(`/playlist/${slug}`)}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Back to course</TooltipContent>
                            </Tooltip>

                            {/* Sidebar Toggle */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 text-white/60 hover:text-white hover:bg-white/10",
                                            !isLeftCollapsed && "bg-white/10 text-white"
                                        )}
                                        onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                                    >
                                        <PanelLeftClose className={cn("h-4 w-4 transition-transform", isLeftCollapsed && "rotate-180")} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{isLeftCollapsed ? "Show sidebar" : "Hide sidebar"}</TooltipContent>
                            </Tooltip>

                            {/* Course Title */}
                            <h1 className="text-sm font-medium truncate text-white/80">
                                {playlist.title}
                            </h1>
                        </div>

                        {/* Right side: Completion, Star, Save, Share, Dark Mode */}
                        <div className="flex items-center gap-1">
                            {/* Completion */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-white/60 text-xs">
                                        <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-medium">
                                            {completionPercent}
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>{completedCount}/{totalCount} completed</TooltipContent>
                            </Tooltip>

                            {/* Star */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-yellow-400 hover:bg-white/10">
                                        <Star className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Rate</TooltipContent>
                            </Tooltip>

                            {/* Save/Bookmark */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10">
                                        <Bookmark className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Save</TooltipContent>
                            </Tooltip>

                            {/* Share */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Share</TooltipContent>
                            </Tooltip>

                            {/* Dark Mode Toggle */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    >
                                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Content based on view mode */}
                    {viewMode === 'video' ? (
                        <div className="flex-1 overflow-y-auto">
                            <div className="max-w-5xl mx-auto p-6 space-y-4">
                                {/* Video Player */}
                                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                                    <EnhancedVideoPlayer
                                        videoId={currentVideo.id}
                                        url={currentVideo.url}
                                        youtubeId={currentVideo.youtubeId || extractYouTubeVideoId(currentVideo.url)}
                                        initialProgress={currentVideo.progress?.[0]?.watchedDuration || 0}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="bg-transparent border-white/10 text-white/70 hover:bg-white/10 hover:text-white">
                                        <ThumbsUp className="h-4 w-4 mr-2" />
                                        Helpful
                                    </Button>
                                    <Button variant="outline" size="sm" className="bg-transparent border-white/10 text-white/70 hover:bg-white/10 hover:text-white">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Discuss
                                    </Button>
                                </div>

                                {/* Prev/Next Navigation */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    {prevVideo ? (
                                        <Link
                                            href={`/playlist/${slug}/watch?video=${prevVideo.id}`}
                                            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span>Previous</span>
                                        </Link>
                                    ) : <div />}
                                    {nextVideo ? (
                                        <Link
                                            href={`/playlist/${slug}/watch?video=${nextVideo.id}`}
                                            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                                        >
                                            <span>Next</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    ) : <div />}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            <div className="max-w-4xl mx-auto p-6">
                                {/* Note Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            {selectedNoteVideo ? `${playlist.videos.findIndex((v: any) => v.id === selectedNoteVideo.id) + 1}. ${selectedNoteVideo.title}` : currentVideo.title}
                                        </h2>
                                        <p className="text-sm text-white/40 mt-1">
                                            {selectedNoteVideo?.updatedAt ? new Date(selectedNoteVideo.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Just now'}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3 text-xs gap-1.5 bg-transparent border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Ask AI
                                    </Button>
                                </div>

                                {/* Note Editor */}
                                <div className="min-h-[400px] relative">
                                    <textarea
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        placeholder="Enter text or type '/' for commands"
                                        className="w-full min-h-[400px] resize-none bg-transparent text-sm leading-relaxed text-white/90 placeholder:text-white/30 focus:outline-none border-0"
                                        spellCheck={false}
                                    />
                                    {/* Auto-save indicator */}
                                    {isSaving && (
                                        <div className="absolute bottom-2 right-2 text-[10px] text-white/40 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                            Saving...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Notes Panel (Drawer) */}
                <div
                    className={cn(
                        "border-l border-white/10 bg-[#0A0A0A] flex flex-col transition-all duration-300 overflow-hidden",
                        isRightOpen ? "w-96" : "w-0"
                    )}
                >
                    {/* Header */}
                    <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-white/10">
                                <FileText className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-semibold">Take Notes</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10"
                                onClick={handleSaveNote}
                                disabled={isSaving}
                            >
                                <Save className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10"
                                onClick={() => setIsRightOpen(false)}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Note Editor */}
                    <div className="flex-1 relative">
                        <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Enter text or type '/' for commands"
                            className="w-full h-full resize-none bg-transparent p-4 text-sm leading-relaxed text-white/90 placeholder:text-white/20 focus:outline-none border-0"
                            spellCheck={false}
                        />
                        {isSaving && (
                            <div className="absolute top-2 right-2 text-[10px] text-white/40 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                Saving...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}
