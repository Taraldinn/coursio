"use client"

import { useState } from "react"
import { VideoPlayer } from "@/components/video-player"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DiscussionSidebar } from "@/components/discussion-sidebar"
import { cn } from "@/lib/utils"
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
    Share2,
    Download,
    MoreVertical,
    Sparkles,
    PlayCircle,
    CheckCircle2,
    Circle,
    X,
    ThumbsUp,
    Bookmark,
    Copy,
    ExternalLink
} from "lucide-react"
import Link from "next/link"
import { formatDuration } from "@/lib/playlist-utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Video {
    id: string
    title: string
    duration: number | null
    position: number
    notes: string | null
    updatedAt: Date | string
    progress?: { completed: boolean }[]
}

interface Playlist {
    id: string
    title: string
    videos: Video[]
}

interface VideoPageLayoutProps {
    video: {
        id: string
        title: string
        url: string | null
        youtubeId: string | null
        duration: number | null
        notes: string | null
    }
    playlist: Playlist
    playlistId: string
    userId: string
    initialProgress: number
}

type LeftPanel = "content" | "discussion" | "notes-list" | "resources" | null

export function VideoPageLayout({
    video,
    playlist,
    playlistId,
    userId,
    initialProgress
}: VideoPageLayoutProps) {
    const router = useRouter()
    const [leftPanel, setLeftPanel] = useState<LeftPanel>("content")
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)
    const [isRightOpen, setIsRightOpen] = useState(false)
    const [isDiscussionOpen, setIsDiscussionOpen] = useState(false)
    const [noteContent, setNoteContent] = useState(video.notes || "")
    const [isSaving, setIsSaving] = useState(false)
    const [isHelpful, setIsHelpful] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    const currentIndex = playlist.videos.findIndex(v => v.id === video.id)
    const prevVideo = currentIndex > 0 ? playlist.videos[currentIndex - 1] : null
    const nextVideo = currentIndex < playlist.videos.length - 1 ? playlist.videos[currentIndex + 1] : null

    const handleSaveNote = async () => {
        setIsSaving(true)
        try {
            const response = await fetch(`/api/videos/${video.id}/notes`, {
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

    const handleHelpful = () => {
        setIsHelpful(!isHelpful)
        toast.success(isHelpful ? "Removed from helpful" : "Marked as helpful!")
    }

    const handleSaveVideo = () => {
        setIsSaved(!isSaved)
        toast.success(isSaved ? "Removed from saved" : "Video saved!")
    }

    const handleShare = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            toast.success("Link copied to clipboard!")
        } catch {
            toast.error("Failed to copy link")
        }
    }

    const handleOpenDiscussion = () => {
        setIsDiscussionOpen(true)
        setIsRightOpen(false)
    }

    const toggleLeftPanel = (panel: LeftPanel) => {
        if (leftPanel === panel && !isLeftCollapsed) {
            setIsLeftCollapsed(true)
        } else {
            setLeftPanel(panel)
            setIsLeftCollapsed(false)
        }
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#0A0A0A] text-white">
            {/* Left Icon Navbar */}
            <div className="w-14 border-r border-white/10 bg-[#0A0A0A] flex flex-col items-center py-4 gap-1 shrink-0">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 mb-4 text-white/60 hover:text-white hover:bg-white/10"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                {/* Drawer Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-10 w-10 text-white/60 hover:text-white hover:bg-white/10",
                        !isLeftCollapsed && "bg-white/10 text-white"
                    )}
                    onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                >
                    {isLeftCollapsed ? <Menu className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                </Button>

                <div className="h-px w-8 bg-white/10 my-2" />

                {/* Content */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-10 w-10 text-white/60 hover:text-white hover:bg-white/10",
                        leftPanel === "content" && !isLeftCollapsed && "bg-white/10 text-white"
                    )}
                    onClick={() => toggleLeftPanel("content")}
                    title="Contents"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Discussion */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-10 w-10 text-white/60 hover:text-white hover:bg-white/10",
                        leftPanel === "discussion" && !isLeftCollapsed && "bg-white/10 text-white"
                    )}
                    onClick={() => toggleLeftPanel("discussion")}
                    title="Discussion"
                >
                    <MessageSquare className="h-5 w-5" />
                </Button>

                {/* Notes List */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-10 w-10 text-white/60 hover:text-white hover:bg-white/10",
                        leftPanel === "notes-list" && !isLeftCollapsed && "bg-white/10 text-white"
                    )}
                    onClick={() => toggleLeftPanel("notes-list")}
                    title="Notes"
                >
                    <FileText className="h-5 w-5" />
                </Button>

                {/* Resources */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-10 w-10 text-white/60 hover:text-white hover:bg-white/10",
                        leftPanel === "resources" && !isLeftCollapsed && "bg-white/10 text-white"
                    )}
                    onClick={() => toggleLeftPanel("resources")}
                    title="Resources"
                >
                    <Folder className="h-5 w-5" />
                </Button>
            </div>

            {/* Left Panel Content (Collapsible) */}
            <div
                className={cn(
                    "border-r border-white/10 bg-[#0F0F0F] flex flex-col transition-all duration-300 overflow-hidden",
                    isLeftCollapsed ? "w-0" : "w-80"
                )}
            >
                {leftPanel === "content" && (
                    <>
                        {/* Header */}
                        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded bg-white/10">
                                    <Menu className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-semibold">Contents</span>
                            </div>
                            <span className="text-xs text-white/40">Browse this course contents</span>
                        </div>

                        {/* Playlist Items */}
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-1">
                                {playlist.videos.map((v, idx) => {
                                    const isCompleted = v.progress?.[0]?.completed
                                    const isCurrent = v.id === video.id
                                    return (
                                        <Link
                                            key={v.id}
                                            href={`/dashboard/playlists/${playlistId}/video/${v.id}`}
                                            className={cn(
                                                "flex items-start gap-3 p-3 rounded-xl transition-all group",
                                                "hover:bg-white/5 border border-transparent",
                                                isCurrent && "bg-white/10 border-white/10"
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
                                        </Link>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </>
                )}

                {leftPanel === "discussion" && (
                    <>
                        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
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
                        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded bg-white/10">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-semibold">Notes</span>
                            </div>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-1">
                                {playlist.videos.map((v, idx) => {
                                    const hasNotes = v.notes && v.notes.length > 0
                                    const isCurrent = v.id === video.id
                                    return (
                                        <button
                                            key={v.id}
                                            onClick={() => {
                                                router.push(`/dashboard/playlists/${playlistId}/video/${v.id}`)
                                                setIsRightOpen(true)
                                            }}
                                            className={cn(
                                                "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all group",
                                                "hover:bg-white/5 border border-transparent",
                                                isCurrent && "bg-white/10 border-white/10"
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
                        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
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
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-white/40 shrink-0" />
                        <h1 className="text-sm font-medium truncate text-white/80">
                            {playlist.title} - Part {currentIndex + 1}
                        </h1>
                    </div>

                    {/* Right Menu */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs gap-1.5 text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            Ask AI
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 text-white/60 hover:text-white hover:bg-white/10",
                                isRightOpen && "bg-white/10 text-white"
                            )}
                            onClick={() => setIsRightOpen(!isRightOpen)}
                            title="Notes"
                        >
                            <FileText className="h-4 w-4" />
                        </Button>
                        <div className="h-4 w-px bg-white/10 mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10">
                            <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10">
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Video Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto p-6 space-y-4">
                        {/* Video Title */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-semibold text-white mb-1">
                                    {currentIndex + 1}. {video.title}
                                </h2>
                                <div className="flex items-center gap-3 text-sm text-white/50">
                                    <span className="px-2 py-0.5 bg-white/10 rounded text-xs">N/A</span>
                                    <span>Video</span>
                                </div>
                            </div>
                        </div>

                        {/* Video Player */}
                        <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                            <VideoPlayer
                                videoId={video.id}
                                url={video.url}
                                youtubeId={video.youtubeId}
                                initialProgress={initialProgress}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "bg-transparent border-white/10 text-white/70 hover:bg-white/10 hover:text-white gap-2",
                                        isHelpful && "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 hover:text-green-300"
                                    )}
                                    onClick={handleHelpful}
                                >
                                    <ThumbsUp className={cn("h-4 w-4", isHelpful && "fill-current")} />
                                    Helpful
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-transparent border-white/10 text-white/70 hover:bg-white/10 hover:text-white gap-2"
                                    onClick={handleOpenDiscussion}
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Discussion
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "bg-transparent border-white/10 text-white/70 hover:bg-white/10 hover:text-white gap-2",
                                        isSaved && "bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 hover:text-yellow-300"
                                    )}
                                    onClick={handleSaveVideo}
                                >
                                    <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                                    Save
                                </Button>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-transparent border-white/10 text-white/70 hover:bg-white/10 hover:text-white gap-2"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        Share
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={handleShare}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy link
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(window.location.href, "_blank")}>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Open in new tab
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Prev/Next Navigation */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            {prevVideo ? (
                                <Link
                                    href={`/dashboard/playlists/${playlistId}/video/${prevVideo.id}`}
                                    className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Previous</span>
                                </Link>
                            ) : <div />}
                            {nextVideo ? (
                                <Link
                                    href={`/dashboard/playlists/${playlistId}/video/${nextVideo.id}`}
                                    className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            ) : <div />}
                        </div>
                    </div>
                </div>
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

            {/* Discussion Sidebar */}
            <DiscussionSidebar
                videoId={video.id}
                isOpen={isDiscussionOpen}
                onClose={() => setIsDiscussionOpen(false)}
            />
        </div>
    )
}
