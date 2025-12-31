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
import { ChevronLeft, MessageSquare, Edit3, Settings, Star, Share2, MoreVertical } from 'lucide-react'

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
        <div className="flex h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden bg-background">
            {/* Left Sidebar: Contents */}
            <div className="w-80 border-r border-border/50 bg-card/30 flex flex-col shrink-0 overflow-hidden hidden lg:flex">
                <CourseContentsSidebar
                    playlist={playlist}
                    currentVideoId={currentVideo.id}
                    playlistId={slug} // Using slug as ID for navigation
                    userId={userId}
                />
            </div>

            {/* Main Content: Player */}
            <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
                {/* Player Header */}
                <div className="h-14 border-b border-border/50 flex items-center justify-between px-4 shrink-0 bg-card/10">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link href={`/playlist/${slug}`} className="text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex flex-col truncate">
                            <span className="text-xs text-muted-foreground hidden sm:block">
                                {playlist.title}
                            </span>
                            <h1 className="text-sm font-semibold truncate">
                                {currentVideo.title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-xs h-8">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Ask AI
                        </Button>
                        <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-xs h-8">
                            <Edit3 className="h-3.5 w-3.5" />
                            Notes
                        </Button>
                        <div className="h-4 w-px bg-border/50 mx-2" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <Star className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Player Area */}
                <div className="flex-1 overflow-y-auto p-0 flex flex-col">
                    <div className="w-full bg-black aspect-video max-h-[70vh] shrink-0">
                        <EnhancedVideoPlayer
                            videoId={currentVideo.id}
                            url={currentVideo.url}
                            youtubeId={currentVideo.youtubeId || extractYouTubeVideoId(currentVideo.url)}
                            initialProgress={currentVideo.progress[0]?.watchedDuration || 0}
                        />
                    </div>

                    <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">{currentVideo.title}</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            {currentVideo.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Notes (Visible on large screens) */}
            <div className="w-96 border-l border-border/50 bg-card/30 flex flex-col shrink-0 overflow-hidden hidden xl:flex">
                <div className="flex items-center justify-between p-3 border-b border-border/50 h-14 bg-card/50">
                    <span className="font-medium text-sm flex items-center gap-2">
                        <Edit3 className="h-4 w-4 text-primary" />
                        Take Notes
                    </span>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Settings className="h-3 w-3" /></Button>
                    </div>
                </div>
                <div className="flex-1 p-0 overflow-hidden">
                    <NotesPanel videoId={currentVideo.id} initialNotes={currentVideo.notes || ""} />
                </div>
            </div>
        </div>
    )
}
