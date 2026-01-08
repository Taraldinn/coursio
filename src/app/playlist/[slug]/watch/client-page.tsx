"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
    BookOpen,
    MessageSquare,
    FileText,
    FolderOpen,
    ArrowLeft,
    PanelLeftClose,
    Video,
    Clock,
    Bot,
    Pencil,
    ThumbsUp,
    Star,
    Bookmark,
    Share2,
    Moon,
    Sun,
    X,
    CloudCheck,
    CheckCircle2,
    Circle,
    File,
    Search,
    Plus,
    GripVertical,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { EnhancedVideoPlayer } from '@/components/enhanced-video-player'
import { extractYouTubeVideoId } from '@/lib/youtube'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WatchPageClientProps {
    playlist: any
    currentVideo: any
    slug: string
    userId: string
}

type LeftPanel = "contents" | "discussions" | "notes" | "resources"
type ViewMode = "video" | "notes"

export function WatchPageClient({
    playlist,
    currentVideo,
    slug,
    userId
}: WatchPageClientProps) {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [activePanel, setActivePanel] = useState<LeftPanel>("contents")
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true)
    const [isNotesOpen, setIsNotesOpen] = useState(true)
    const [noteContent, setNoteContent] = useState(currentVideo.notes || "")
    const [isSaving, setIsSaving] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>("video")
    const [selectedNoteVideo, setSelectedNoteVideo] = useState<any>(null)
    const [notesSearchQuery, setNotesSearchQuery] = useState("")
    const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)

    const currentIndex = playlist.videos.findIndex((v: any) => v.id === currentVideo.id)
    const prevVideo = currentIndex > 0 ? playlist.videos[currentIndex - 1] : null
    const nextVideo = currentIndex < playlist.videos.length - 1 ? playlist.videos[currentIndex + 1] : null

    // Calculate completion
    const completedCount = playlist.videos.filter((v: any) => v.progress?.[0]?.completed).length
    const totalCount = playlist.videos.length
    const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        if (h > 0) return `${h}.${Math.round(m / 6)} hours`
        return `${m} minutes`
    }

    const formatRelativeDate = (date: Date | string | null) => {
        if (!date) return "No date"
        const now = new Date()
        const d = new Date(date)
        const diffMs = now.getTime() - d.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
        return `${Math.floor(diffDays / 365)} years ago`
    }

    // Filter videos that have notes for the notes panel
    const videosWithNotes = playlist.videos.filter((v: any) => v.notes && v.notes.length > 0)
    const filteredNotesVideos = notesSearchQuery
        ? videosWithNotes.filter((v: any) => v.title.toLowerCase().includes(notesSearchQuery.toLowerCase()))
        : videosWithNotes

    // Handle note selection
    const handleNoteSelect = (video: any) => {
        setSelectedNoteVideo(video)
        setNoteContent(video.notes || "")
        setViewMode("notes")
        setActivePanel("notes")
    }

    // Switch back to video mode
    const handleBackToVideo = () => {
        setViewMode("video")
        setSelectedNoteVideo(null)
        setNoteContent(currentVideo.notes || "")
    }

    // Auto-save notes with debounce
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        // Determine which video's notes we're saving
        const targetVideo = viewMode === "notes" && selectedNoteVideo ? selectedNoteVideo : currentVideo
        const originalNotes = targetVideo.notes || ""

        saveTimeoutRef.current = setTimeout(async () => {
            if (noteContent !== originalNotes) {
                setIsSaving(true)
                try {
                    const response = await fetch(`/api/videos/${targetVideo.id}/notes`, {
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
            }
        }, 1000)

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [noteContent, currentVideo.id, currentVideo.notes, viewMode, selectedNoteVideo])

    // Update notes when video changes
    useEffect(() => {
        setNoteContent(currentVideo.notes || "")
    }, [currentVideo.id, currentVideo.notes])

    const navItems = [
        { id: "contents" as const, icon: BookOpen, label: "Contents" },
        { id: "discussions" as const, icon: MessageSquare, label: "Discussions" },
        { id: "notes" as const, icon: FileText, label: "Notes" },
        { id: "resources" as const, icon: FolderOpen, label: "Resources" },
    ]

    return (
        <TooltipProvider>
            <div className="bg-background h-screen overflow-hidden">
                <div className="from-background to-background/95 flex h-screen flex-col overflow-hidden bg-gradient-to-br">
                    <div className="relative flex h-full min-h-0">
                        <div className="grid flex-1 grid-cols-[auto_auto_1fr]">
                            {/* Left Icon Navbar */}
                            <div className="border-border bg-card/50 z-50 flex h-full w-16 flex-col border-r backdrop-blur-sm">
                                {/* Logo */}
                                <div className="border-border flex h-16 items-center justify-center border-b">
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            C
                                        </div>
                                    </button>
                                </div>

                                {/* Nav Icons */}
                                <div className="flex flex-1 flex-col items-center gap-2 py-4">
                                    {navItems.map((item) => (
                                        <Tooltip key={item.id}>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => {
                                                        setActivePanel(item.id)
                                                        setIsLeftPanelOpen(true)
                                                    }}
                                                    className={cn(
                                                        "group relative h-12 w-12 rounded-sm transition-all duration-200 flex items-center justify-center",
                                                        activePanel === item.id && isLeftPanelOpen
                                                            ? "bg-primary/10 text-primary hover:bg-primary/15"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                                                    )}
                                                >
                                                    <item.icon className="h-5 w-5" />
                                                    {activePanel === item.id && isLeftPanelOpen && (
                                                        <div className="bg-primary absolute top-1/2 -left-1 h-6 w-1 -translate-y-1/2 transform rounded-r-full" />
                                                    )}
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">{item.label}</TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>

                            {/* Left Panel Content */}
                            <div
                                className={cn(
                                    "border-border bg-card/30 flex flex-col overflow-hidden border-r backdrop-blur-sm transition-all duration-300 ease-in-out",
                                    isLeftPanelOpen ? "w-80 opacity-100" : "w-0 opacity-0"
                                )}
                            >
                                {/* Panel Header */}
                                <div className="border-border from-primary/5 via-primary/10 to-primary/5 flex h-16 items-center border-b bg-gradient-to-r px-4 backdrop-blur-sm">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="bg-primary/10 text-primary rounded-lg p-1.5">
                                            {activePanel === "contents" && <BookOpen className="h-4 w-4" />}
                                            {activePanel === "discussions" && <MessageSquare className="h-4 w-4" />}
                                            {activePanel === "notes" && <FileText className="h-4 w-4" />}
                                            {activePanel === "resources" && <FolderOpen className="h-4 w-4" />}
                                        </div>
                                        <div className="flex min-w-0 flex-col">
                                            <h2 className="truncate text-sm font-semibold">
                                                {activePanel === "contents" && "Contents"}
                                                {activePanel === "discussions" && "Discussions"}
                                                {activePanel === "notes" && "Notes"}
                                                {activePanel === "resources" && "Resources"}
                                            </h2>
                                            <p className="text-muted-foreground text-xs">
                                                {activePanel === "contents" && "Browse the course contents"}
                                                {activePanel === "discussions" && "Join the conversation"}
                                                {activePanel === "notes" && "Access all your notes"}
                                                {activePanel === "resources" && "Download course materials"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Panel Content */}
                                <div className="flex-1 overflow-y-auto">
                                    <div className="p-4">
                                        {activePanel === "contents" && (
                                            <div className="space-y-2">
                                                {playlist.videos.map((v: any, idx: number) => {
                                                    const isCompleted = v.progress?.[0]?.completed
                                                    const isCurrent = v.id === currentVideo.id
                                                    return (
                                                        <button
                                                            key={v.id}
                                                            onClick={() => router.push(`/playlist/${slug}/watch?video=${v.id}`)}
                                                            className={cn(
                                                                "group grid w-full grid-cols-[auto_1fr] items-center gap-3 rounded-md border-l-4 p-2 text-left transition-colors hover:bg-accent/50",
                                                                isCurrent ? "border-primary bg-accent/30" : "border-transparent"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "flex items-center justify-center size-8 rounded-md",
                                                                isCompleted ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                                                            )}>
                                                                {isCompleted ? (
                                                                    <CheckCircle2 className="size-3.5" />
                                                                ) : (
                                                                    <Video className="size-3.5" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className={cn(
                                                                    "truncate text-sm font-medium transition-colors",
                                                                    isCurrent ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                                                )}>
                                                                    {v.title}
                                                                </div>
                                                                <div className="text-muted-foreground mt-0.5 text-xs">
                                                                    Video • {formatDuration(v.duration || 0)}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {activePanel === "discussions" && (
                                            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                                                Coming soon...
                                            </div>
                                        )}

                                        {activePanel === "notes" && (
                                            <div className="min-w-0 space-y-4 overflow-hidden">
                                                {/* Search and Add */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative w-full">
                                                            <Search className="pointer-events-none text-muted-foreground absolute inset-y-0 left-3 my-auto h-4 w-4" />
                                                            <Input
                                                                placeholder="Search notes..."
                                                                value={notesSearchQuery}
                                                                onChange={(e) => setNotesSearchQuery(e.target.value)}
                                                                className="pl-10 w-full"
                                                            />
                                                        </div>
                                                        <Button variant="outline" size="icon" className="shrink-0">
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Notes List */}
                                                <div className="space-y-2">
                                                    <div className="flex flex-col gap-2 items-start justify-start">
                                                        {filteredNotesVideos.length === 0 ? (
                                                            <div className="text-center text-muted-foreground text-sm py-8 w-full">
                                                                {notesSearchQuery ? "No notes found" : "No notes yet. Start taking notes on any video!"}
                                                            </div>
                                                        ) : (
                                                            filteredNotesVideos.map((v: any) => {
                                                                const isSelected = selectedNoteVideo?.id === v.id && viewMode === "notes"
                                                                return (
                                                                    <button
                                                                        key={v.id}
                                                                        onClick={() => handleNoteSelect(v)}
                                                                        className="block w-full"
                                                                    >
                                                                        <div className={cn(
                                                                            "group grid w-full grid-cols-[auto_1fr] items-center gap-3 rounded-md border-l-4 p-2 text-left transition-colors",
                                                                            isSelected ? "bg-accent border-primary" : "border-transparent hover:bg-accent/50"
                                                                        )}>
                                                                            <div className="flex items-center justify-center size-8 rounded-md bg-amber-500/10 text-amber-500">
                                                                                <Pencil className="size-3.5" />
                                                                            </div>
                                                                            <div className="min-w-0 flex-1">
                                                                                <div className={cn(
                                                                                    "truncate text-sm font-medium transition-colors",
                                                                                    isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                                                                )}>
                                                                                    {v.title}
                                                                                </div>
                                                                                <div className="text-muted-foreground mt-0.5 text-xs">
                                                                                    {formatRelativeDate(v.updatedAt)}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                )
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activePanel === "resources" && (
                                            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                                                No resources available
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex min-w-0 flex-col overflow-hidden">
                                {/* Top Header Bar */}
                                <div className="border-border/50 bg-background flex h-16 items-center justify-between border-b px-4">
                                    <div className="flex items-center gap-3">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => router.push(`/playlist/${slug}`)}
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Back to course</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
                                                >
                                                    <PanelLeftClose className={cn("h-4 w-4 transition-transform", !isLeftPanelOpen && "rotate-180")} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{isLeftPanelOpen ? "Hide sidebar" : "Show sidebar"}</TooltipContent>
                                        </Tooltip>

                                        <h1 className="tracking-tight text-left text-muted-foreground truncate text-base font-medium">
                                            {playlist.title}
                                        </h1>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Progress Circle */}
                                        <button className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors">
                                            <div className="relative inline-flex items-center justify-center">
                                                <svg className="-rotate-90 transform size-8" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-primary/20" />
                                                    <circle
                                                        cx="50" cy="50" r="45"
                                                        stroke="currentColor"
                                                        strokeWidth="6"
                                                        fill="transparent"
                                                        strokeDasharray={282.74}
                                                        strokeDashoffset={282.74 - (282.74 * completionPercent / 100)}
                                                        strokeLinecap="round"
                                                        className="transition-all duration-300 text-primary"
                                                    />
                                                </svg>
                                                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 select-none items-center justify-center text-[10px]">
                                                    {completionPercent}
                                                </div>
                                            </div>
                                        </button>

                                        {/* Star Rating */}
                                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-4">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-xs font-medium">0</span>
                                        </Button>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                                    <Bookmark className="h-3 w-3" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Bookmark</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                                    <Share2 className="h-3 w-3" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Share</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9"
                                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                                >
                                                    {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>

                                {/* Main Content with optional Notes Panel */}
                                <div className="relative flex min-h-0 flex-1">
                                    {/* Main Content Area - Video or Notes Page */}
                                    <main className="relative min-w-0 flex-1 overflow-y-auto">
                                        <div className="bg-muted/20 min-h-full transition-all duration-300">
                                            {viewMode === "video" ? (
                                                /* Video View */
                                                <div className="container mx-auto max-w-5xl px-6 py-6">
                                                    <div className="space-y-6">
                                                        {/* Video Header */}
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex min-w-0 items-start gap-4">
                                                                <div className="bg-primary/10 text-primary rounded-lg p-3">
                                                                    <Video className="h-6 w-6" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h1 className="mb-2 text-2xl font-bold">{currentVideo.title}</h1>
                                                                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                                                                        <div className="flex items-center gap-1">
                                                                            <Clock className="h-4 w-4" />
                                                                            <span>{formatDuration(currentVideo.duration || 0)}</span>
                                                                        </div>
                                                                        <span className="inline-flex items-center justify-center border px-2 py-0.5 text-xs font-medium rounded-sm capitalize">
                                                                            Video
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className={cn("h-8 gap-2", isAIPanelOpen && "bg-primary/10")}
                                                                    onClick={() => {
                                                                        if (!isAIPanelOpen) {
                                                                            setIsNotesOpen(false)
                                                                        }
                                                                        setIsAIPanelOpen(!isAIPanelOpen)
                                                                    }}
                                                                >
                                                                    <Bot className="h-4 w-4" />
                                                                    Ask AI
                                                                </Button>
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className={cn("h-8 gap-2", isNotesOpen && !isAIPanelOpen && "bg-primary/10")}
                                                                    onClick={() => {
                                                                        if (!isNotesOpen) {
                                                                            setIsAIPanelOpen(false)
                                                                        }
                                                                        setIsNotesOpen(!isNotesOpen)
                                                                    }}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    Notes
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Video Player */}
                                                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                                            <EnhancedVideoPlayer
                                                                videoId={currentVideo.id}
                                                                url={currentVideo.url}
                                                                youtubeId={currentVideo.youtubeId || extractYouTubeVideoId(currentVideo.url)}
                                                                initialProgress={currentVideo.progress?.[0]?.watchedDuration || 0}
                                                            />
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="border-border border-t pt-6">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <Button variant="ghost" size="sm" className="h-8 gap-2">
                                                                        <ThumbsUp className="h-4 w-4" />
                                                                        Helpful
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" className="h-8 gap-2">
                                                                        <MessageSquare className="h-4 w-4" />
                                                                        Discuss
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Notes Page View */
                                                <div className="container mx-auto max-w-4xl px-6 py-6">
                                                    <div className="space-y-4">
                                                        {/* Notes Header */}
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <button
                                                                    onClick={() => {
                                                                        if (selectedNoteVideo) {
                                                                            router.push(`/playlist/${slug}/watch?video=${selectedNoteVideo.id}`)
                                                                        }
                                                                        handleBackToVideo()
                                                                    }}
                                                                    className="hover:text-primary hover:underline"
                                                                >
                                                                    <h4 className="text-xl font-bold">
                                                                        {selectedNoteVideo?.title || currentVideo.title}
                                                                    </h4>
                                                                </button>
                                                                <span className="text-muted-foreground mt-1.5 block text-xs capitalize">
                                                                    {formatRelativeDate(selectedNoteVideo?.updatedAt || currentVideo.updatedAt)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isSaving ? (
                                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                                                        <span className="text-xs">Saving...</span>
                                                                    </div>
                                                                ) : (
                                                                    <CloudCheck className="h-4 w-4 text-green-500" />
                                                                )}
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="h-8 gap-2"
                                                                    onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
                                                                >
                                                                    <Bot className="h-4 w-4" />
                                                                    Ask AI
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Divider */}
                                                        <div className="from-primary/5 via-primary/10 to-primary/5 mt-5 mb-3 h-[1px] w-full bg-gradient-to-r" />

                                                        {/* Notes Editor - Full Page */}
                                                        <div className="min-h-[500px]">
                                                            <textarea
                                                                value={noteContent}
                                                                onChange={(e) => setNoteContent(e.target.value)}
                                                                placeholder="Start taking notes..."
                                                                className="w-full h-full min-h-[500px] resize-none bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none border-0 p-2"
                                                                spellCheck={false}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </main>

                                    {/* Right Panel - Notes (video mode) or AI Assistant (notes mode) */}
                                    {viewMode === "video" && isNotesOpen && !isAIPanelOpen && (
                                        <aside className="relative flex h-full flex-shrink-0">
                                            <div className="border-border bg-card/50 flex h-full flex-col overflow-hidden border-l backdrop-blur-sm w-96">
                                                {/* Resize Handle */}
                                                <div className="hover:bg-primary/20 absolute top-0 left-0 z-10 h-full w-1 cursor-col-resize transition-colors">
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                                                        <GripVertical className="text-muted-foreground/50 h-4 w-4" />
                                                    </div>
                                                </div>

                                                {/* Notes Header */}
                                                <div className="flex-shrink-0">
                                                    <div className="border-border from-primary/5 via-primary/10 to-primary/5 flex h-12 items-center justify-between border-b bg-gradient-to-r px-4">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-5 w-5 text-blue-500" />
                                                            <div>
                                                                <h3 className="text-sm font-semibold">Take Notes</h3>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isSaving ? (
                                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                                                    <span className="text-xs">Saving...</span>
                                                                </div>
                                                            ) : (
                                                                <CloudCheck className="h-4 w-4 text-green-500" />
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => setIsNotesOpen(false)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Notes Editor */}
                                                <div className="flex-1 overflow-y-auto">
                                                    <div className="h-full p-4">
                                                        <textarea
                                                            value={noteContent}
                                                            onChange={(e) => setNoteContent(e.target.value)}
                                                            placeholder="Start taking notes..."
                                                            className="w-full h-full min-h-[400px] resize-none bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none border-0"
                                                            spellCheck={false}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </aside>
                                    )}

                                    {/* AI Assistant Panel (for notes page view) */}
                                    {(viewMode === "notes" || isAIPanelOpen) && (
                                        <aside className="relative flex h-full flex-shrink-0">
                                            <div className="border-border bg-card/50 flex h-full flex-col overflow-hidden border-l backdrop-blur-sm w-96">
                                                {/* Resize Handle */}
                                                <div className="hover:bg-primary/20 absolute top-0 left-0 z-10 h-full w-1 cursor-col-resize transition-colors">
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                                                        <GripVertical className="text-muted-foreground/50 h-4 w-4" />
                                                    </div>
                                                </div>

                                                {/* AI Header */}
                                                <div className="flex-shrink-0">
                                                    <div className="border-border from-primary/5 via-primary/10 to-primary/5 flex h-12 items-center justify-between border-b bg-gradient-to-r px-4">
                                                        <div className="flex items-center gap-3">
                                                            <Bot className="h-5 w-5 text-blue-500" />
                                                            <div>
                                                                <h3 className="text-sm font-semibold">AI Assistant</h3>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => {
                                                                    setIsAIPanelOpen(false)
                                                                    if (viewMode === "notes") {
                                                                        handleBackToVideo()
                                                                    }
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* AI Content */}
                                                <div className="flex-1 overflow-y-auto">
                                                    <div className="h-full p-4">
                                                        <div className="flex h-full flex-col">
                                                            <div className="mb-4 flex-1 overflow-y-auto">
                                                                <div className="py-8 text-center">
                                                                    <Bot className="text-primary mx-auto mb-4 h-12 w-12" />
                                                                    <h3 className="mb-2 text-lg font-semibold">AI Assistant</h3>
                                                                    <p className="text-muted-foreground text-sm">
                                                                        Assistant plugin will be available soon
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </aside>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}
