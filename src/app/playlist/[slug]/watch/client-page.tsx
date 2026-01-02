"use client"

import { useState } from 'react'
import Link from 'next/link'
import {
    ChevronLeft,
    MessageSquare,
    Edit3,
    Settings,
    MoreVertical,
    ThumbsUp,
    Flag,
    Clock,
    Video,
    Sparkles,
    PenLine,
    Layout,
    Folder,
    Share2,
    Maximize2,
    X,
    FileText,
    PanelLeftClose,
    PanelLeftOpen,
    ArrowLeft
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CourseContentsSidebar } from '@/components/course-contents-sidebar'
import { EnhancedVideoPlayer } from '@/components/enhanced-video-player'
import { NotesPanel } from '@/components/notes-panel'
import { NotesSidebar } from '@/components/notes-sidebar'
import { extractYouTubeVideoId } from '@/lib/youtube'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WatchPageClientProps {
    playlist: any // Type this properly if shared types exist
    currentVideo: any
    slug: string
    userId: string
}

export function WatchPageClient({
    playlist,
    currentVideo,
    slug,
    userId
}: WatchPageClientProps) {
    const [isContentOpen, setIsContentOpen] = useState(true)
    const [isNotesOpen, setIsNotesOpen] = useState(false)

    // Handle saving notes from the sidebar
    const handleNoteSave = async (videoId: string, note: string) => {
        if (slug === 'development-mode') {
            console.log("Mock Mode: Note saved successfully", note)
            // Evaluate command if user types /
            return
        }

        try {
            const response = await fetch(`/api/videos/${videoId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: note }),
            })

            if (!response.ok) throw new Error("Failed to save notes")
        } catch (error) {
            console.error("Failed to save note", error)
            throw error
        }
    }

    return (
        <TooltipProvider>
            <div className="flex h-screen w-full bg-black text-white overflow-hidden">
                {/* 1. Course Contents Drawer (Left Sidebar) */}
                <div
                    className={cn(
                        "bg-[#0A0A0A] border-r border-white/10 flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
                        isContentOpen ? "w-[320px] opacity-100" : "w-0 opacity-0 border-none"
                    )}
                >
                    {/* Header for Sidebar */}
                    <div className="h-14 flex items-center px-4 border-b border-white/10 shrink-0 gap-3 min-w-[320px]">
                        <h2 className="font-semibold text-sm text-white">Course Content</h2>
                    </div>

                    {/* Content List */}
                    <div className="flex-1 overflow-hidden min-w-[320px] h-full">
                        <CourseContentsSidebar
                            playlist={playlist}
                            currentVideoId={currentVideo.id}
                            playlistId={slug}
                            userId={userId}
                        />
                    </div>
                </div>

                {/* 2. Main Content Area (Player) */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#000] relative">
                    {/* Top Navigation Bar */}
                    <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#0A0A0A] shrink-0">
                        <div className="flex items-center gap-2">
                            {/* Back to Course Button */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-lg" asChild>
                                        <Link href={`/playlist/${slug}`}>
                                            <ArrowLeft className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Back to course</TooltipContent>
                            </Tooltip>

                            {/* Toggle Sidebar Button */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors",
                                            !isContentOpen && "text-white bg-white/10"
                                        )}
                                        onClick={() => setIsContentOpen(!isContentOpen)}
                                    >
                                        <PanelLeftClose className={cn("h-5 w-5 transition-transform", !isContentOpen && "rotate-180")} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    {isContentOpen ? "Hide sidebar" : "Show sidebar"}
                                </TooltipContent>
                            </Tooltip>

                            <div className="h-6 w-[1px] bg-white/10 mx-2" />

                            {/* Course Title */}
                            <h1 className="text-sm font-medium text-white/90 truncate max-w-[400px]">
                                {playlist.title}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="h-8 gap-2 bg-transparent border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-xs font-medium rounded-lg">
                                <Sparkles className="h-3.5 w-3.5" />
                                Ask AI
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "h-8 gap-2 bg-transparent border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-xs font-medium rounded-lg transition-colors",
                                    isNotesOpen && "bg-white/10 text-white border-white/20"
                                )}
                                onClick={() => setIsNotesOpen(!isNotesOpen)}
                            >
                                <Edit3 className="h-3.5 w-3.5" />
                                Notes
                            </Button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {/* Video Title & Actions */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-white tracking-tight">{currentVideo.title}</h2>
                            </div>
                        </div>

                        {/* Video Player */}
                        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group">
                            <EnhancedVideoPlayer
                                videoId={currentVideo.id}
                                url={currentVideo.url}
                                youtubeId={currentVideo.youtubeId || extractYouTubeVideoId(currentVideo.url)}
                                initialProgress={currentVideo.progress[0]?.watchedDuration || 0}
                            />
                        </div>

                        {/* Video Meta / Footer */}
                        <div className="mt-6 flex items-center justify-between text-sm text-white/40 pb-10">
                            <div className="flex items-center gap-6">
                                <button className="flex items-center gap-2 hover:text-white transition">
                                    <ThumbsUp className="h-4 w-4" />
                                    Helpful
                                </button>
                                <button className="flex items-center gap-2 hover:text-white transition">
                                    <MessageSquare className="h-4 w-4" />
                                    Discuss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Right Sidebar: Notes */}
                <div
                    className={cn(
                        "border-l border-white/10 bg-[#0A0A0A] flex flex-col shrink-0 z-40 transition-all duration-300 ease-in-out overflow-hidden shadow-2xl",
                        isNotesOpen ? "w-[400px] opacity-100" : "w-0 opacity-0 border-none"
                    )}
                >
                    {/* Notes Sidebar Content */}
                    <div className="flex-1 overflow-hidden min-w-[400px]">
                        <NotesSidebar
                            videos={playlist.videos}
                            currentVideoId={currentVideo.id}
                            onNoteSave={handleNoteSave}
                            onVideoSelect={(id) => {
                                // Optional: Navigate to video if desired
                                // router.push(`/playlist/${slug}/watch?v=${id}`)
                            }}
                        />
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}

