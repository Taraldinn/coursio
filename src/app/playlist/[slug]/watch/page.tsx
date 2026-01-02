import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { EnhancedVideoPlayer } from '@/components/enhanced-video-player'
import { NotesPanel } from '@/components/notes-panel'
import { CourseContentsSidebar } from '@/components/course-contents-sidebar'
import { extractYouTubeVideoId } from '@/lib/youtube'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
    FileText
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function WatchPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ video?: string }>
}) {
    const { userId } = await auth()
    const { slug } = await params
    const { video: videoId } = await searchParams

    if (!userId) {
        redirect('/sign-in')
    }

    const playlist = await prisma.playlist.findUnique({
        where: { slug },
        include: {
            videos: {
                orderBy: { position: 'asc' },
                include: {
                    progress: {
                        where: { userId },
                    },
                },
            },
        },
    })

    if (!playlist) {
        redirect('/dashboard')
    }

    // Determine current video
    let currentVideo = null
    if (videoId) {
        currentVideo = playlist.videos.find((v) => v.id === videoId)
    }

    // If no video specified, find first incomplete or just first
    if (!currentVideo) {
        currentVideo = playlist.videos.find((v) => !v.progress[0]?.completed) || playlist.videos[0]
    }

    if (!currentVideo) {
        return (
            <div className="container py-8 text-center text-white">
                <h1 className="text-2xl font-bold">No videos in this playlist</h1>
                <Button asChild className="mt-4">
                    <Link href={`/playlist/${slug}`}>Back to Playlist</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full bg-black text-white overflow-hidden">
            {/* 1. Navigation Rail (Fixed Leftmost) */}
            <div className="w-[60px] flex flex-col items-center py-4 gap-4 border-r border-white/10 bg-[#0A0A0A] shrink-0 z-50">
                <Link href="/dashboard" className="mb-4">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                        <Video className="h-4 w-4 text-primary-foreground" />
                    </div>
                </Link>

                {/* Rail Icons */}
                <div className="flex flex-col gap-2 w-full px-2">
                    <div className="group relative flex justify-center">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-white bg-white/10 rounded-xl">
                            <Layout className="h-5 w-5" />
                        </Button>
                        <span className="absolute left-[3.2rem] top-1/2 -translate-y-1/2 bg-[#222] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-white/10 pointer-events-none z-50">
                            Contents
                        </span>
                    </div>

                    <div className="group relative flex justify-center">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-white/50 hover:text-white hover:bg-white/5 rounded-xl">
                            <MessageSquare className="h-5 w-5" />
                        </Button>
                        <span className="absolute left-[3.2rem] top-1/2 -translate-y-1/2 bg-[#222] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-white/10 pointer-events-none z-50">
                            Discussion
                        </span>
                    </div>

                    <div className="group relative flex justify-center">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-white/50 hover:text-white hover:bg-white/5 rounded-xl">
                            <Edit3 className="h-5 w-5" />
                        </Button>
                        <span className="absolute left-[3.2rem] top-1/2 -translate-y-1/2 bg-[#222] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-white/10 pointer-events-none z-50">
                            Notes
                        </span>
                    </div>

                    <div className="group relative flex justify-center">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-white/50 hover:text-white hover:bg-white/5 rounded-xl">
                            <Folder className="h-5 w-5" />
                        </Button>
                        <span className="absolute left-[3.2rem] top-1/2 -translate-y-1/2 bg-[#222] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-white/10 pointer-events-none z-50">
                            Resources
                        </span>
                    </div>
                </div>

                <div className="mt-auto flex flex-col gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-white/50 hover:text-white hover:bg-white/5 rounded-xl">
                        <Link href={`/playlist/${slug}`}>
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* 2. Course Contents Drawer (Left Sidebar) */}
            <div className="w-[320px] bg-[#0A0A0A] border-r border-white/10 flex flex-col shrink-0 transition-all duration-300 ease-in-out relative">
                {/* Header for Sidebar */}
                <div className="h-16 flex items-center px-4 border-b border-white/10 shrink-0 gap-3">
                    <h2 className="font-semibold text-sm text-white">Contents</h2>
                    <span className="text-[10px] text-white/40">Browse the course contents</span>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-hidden">
                    <CourseContentsSidebar
                        playlist={playlist}
                        currentVideoId={currentVideo.id}
                        playlistId={slug}
                        userId={userId}
                    />
                </div>

                {/* Drawer Toggle Handle (Visual only for now, logic could be added) */}
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 hidden lg:flex">
                    <div className="h-12 w-1 bg-[#1A1A1A] border border-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10 transition">
                        {/* <ChevronLeft className="h-3 w-3 text-white/50" /> */}
                    </div>
                </div>
            </div>

            {/* 3. Main Content Area (Player) */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#000] relative">
                {/* Top Navigation Bar */}
                <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0A0A0A]/50 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition text-xs font-medium">
                            <Layout className="h-3.5 w-3.5" />
                            Dashboard
                        </Link>
                        <span className="text-white/20">/</span>
                        <span className="text-xs text-white/90 font-medium truncate max-w-[200px]">{playlist.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-yellow-500 text-xs font-medium">
                            <span className="w-5 h-5 rounded-full bg-yellow-500/10 flex items-center justify-center text-[10px]">★</span>
                            0
                        </div>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white">
                            <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {/* Video Title & Actions */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                                <Video className="h-4 w-4 text-white/70" />
                            </div>
                            <h1 className="text-xl font-bold text-white tracking-tight">{currentVideo.title}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 gap-2 bg-transparent border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-xs font-medium rounded-lg">
                                <Sparkles className="h-3.5 w-3.5" />
                                Ask AI
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 gap-2 bg-transparent border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-xs font-medium rounded-lg">
                                <Edit3 className="h-3.5 w-3.5" />
                                Notes
                            </Button>
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
                    <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 hover:text-white transition">
                                <ThumbsUp className="h-3.5 w-3.5" />
                                Helpful
                            </button>
                            <button className="flex items-center gap-2 hover:text-white transition">
                                <MessageSquare className="h-3.5 w-3.5" />
                                Discuss
                            </button>
                        </div>
                        <span>{currentVideo.id}</span>
                    </div>
                </div>
            </div>

            {/* 4. Right Sidebar: Notes */}
            <div className="w-[360px] border-l border-white/10 bg-[#0A0A0A] flex flex-col shrink-0 z-40 hidden xl:flex">
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2 text-white font-medium text-sm">
                        <div className="p-1 bg-blue-500/20 rounded">
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        Take Notes
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white">
                            <Maximize2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white">
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 relative bg-[#0A0A0A]">
                    <NotesPanel videoId={currentVideo.id} initialNotes={currentVideo.notes || ""} />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/20" />
                </div>

                <div className="h-10 border-t border-white/10 flex items-center px-4 text-[10px] text-white/30 bg-[#0F0F0F]">
                    Enter text or type '/' for commands
                </div>
            </div>
        </div>
    )
}
