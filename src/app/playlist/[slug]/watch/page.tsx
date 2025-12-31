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
    PenLine
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
        <div className="flex h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden bg-black text-white">
            {/* Left Sidebar: Contents */}
            <div className="w-[320px] border-r border-white/10 bg-[#0A0A0A] flex flex-col shrink-0 overflow-hidden hidden lg:flex">
                <CourseContentsSidebar
                    playlist={playlist}
                    currentVideoId={currentVideo.id}
                    playlistId={slug} // Using slug as ID for navigation
                    userId={userId}
                />
            </div>

            {/* Main Content: Player */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0F0F0F] overflow-hidden relative">
                {/* Player Header */}
                <div className="h-16 flex items-center justify-between px-6 shrink-0 bg-[#0F0F0F]">
                    <div className="flex items-center gap-4 min-w-0">
                        {/* Back Button */}
                        <Link href={`/playlist/${slug}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                <Video className="h-5 w-5 text-white/70" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-base font-bold text-white leading-tight truncate max-w-md">
                                    {currentVideo.title}
                                </h1>
                                <div className="flex items-center gap-2 text-xs text-white/50 font-medium mt-0.5">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        N/A
                                    </span>
                                    <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-white/10 text-white/70 hover:bg-white/20 border-0 rounded-sm">
                                        Video
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="secondary" size="sm" className="hidden sm:flex gap-2 text-xs h-8 bg-white/5 hover:bg-white/10 text-white border-white/10">
                            <Sparkles className="h-3.5 w-3.5" />
                            Ask AI
                        </Button>
                        <Button variant="secondary" size="sm" className="hidden sm:flex gap-2 text-xs h-8 bg-white/5 hover:bg-white/10 text-white border-white/10">
                            <PenLine className="h-3.5 w-3.5" />
                            Notes
                        </Button>
                    </div>
                </div>

                {/* Player Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 flex flex-col custom-scrollbar">
                    <div className="w-full px-6 pb-4">
                        <div className="w-full bg-black aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 relative z-10">
                            <EnhancedVideoPlayer
                                videoId={currentVideo.id}
                                url={currentVideo.url}
                                youtubeId={currentVideo.youtubeId || extractYouTubeVideoId(currentVideo.url)}
                                initialProgress={currentVideo.progress[0]?.watchedDuration || 0}
                            />
                        </div>
                    </div>

                    <div className="px-6 pb-10 max-w-5xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5 gap-2 pl-0">
                                    <ThumbsUp className="h-4 w-4" />
                                    Helpful
                                </Button>
                                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5 gap-2">
                                    <Flag className="h-4 w-4" />
                                    Discuss
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Notes (Visible on large screens) */}
            <div className="w-[350px] border-l border-white/10 bg-[#0A0A0A] flex flex-col shrink-0 overflow-hidden hidden xl:flex">
                <div className="flex items-center justify-between px-4 h-14 border-b border-white/10 shrink-0">
                    <span className="font-semibold text-sm flex items-center gap-2 text-white">
                        <Edit3 className="h-4 w-4 text-primary" />
                        Take Notes
                    </span>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10">
                            <Settings className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10">
                            <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
                <div className="flex-1 p-0 overflow-hidden relative">
                    <NotesPanel videoId={currentVideo.id} initialNotes={currentVideo.notes || ""} />
                </div>
            </div>
        </div>
    )
}
