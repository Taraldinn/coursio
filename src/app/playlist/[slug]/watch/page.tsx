import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { EnhancedVideoPlayer } from '@/components/enhanced-video-player'
import { NotesPanel } from '@/components/notes-panel'
import { extractYouTubeVideoId } from '@/lib/youtube'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        // Empty playlist
        return (
            <div className="container py-8 text-center">
                <h1 className="text-2xl font-bold">No videos in this playlist</h1>
                <Button asChild className="mt-4">
                    <Link href={`/playlist/${slug}`}>Back to Playlist</Link>
                </Button>
            </div>
        )
    }

    // Find next/prev videos
    const currentIndex = playlist.videos.findIndex((v) => v.id === currentVideo!.id)
    const prevVideo = currentIndex > 0 ? playlist.videos[currentIndex - 1] : null
    const nextVideo = currentIndex < playlist.videos.length - 1 ? playlist.videos[currentIndex + 1] : null

    return (
        <div className="container max-w-[1600px] py-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                {/* Main Content */}
                <div className="space-y-6">
                    {/* Video Player */}
                    <EnhancedVideoPlayer
                        videoId={currentVideo.id}
                        url={currentVideo.url}
                        youtubeId={currentVideo.youtubeId || extractYouTubeVideoId(currentVideo.url)}
                        initialProgress={currentVideo.progress[0]?.watchedDuration || 0}
                    />

                    {/* Video Info */}
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{currentVideo.title}</h1>
                                <p className="mt-2 text-muted-foreground">{currentVideo.description}</p>
                            </div>

                            <div className="flex gap-2">
                                {prevVideo && (
                                    <Button variant="outline" asChild>
                                        <Link href={`/playlist/${slug}/watch?video=${prevVideo.id}`}>
                                            <ChevronLeft className="mr-2 h-4 w-4" />
                                            Previous
                                        </Link>
                                    </Button>
                                )}
                                {nextVideo && (
                                    <Button asChild>
                                        <Link href={`/playlist/${slug}/watch?video=${nextVideo.id}`}>
                                            Next
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Notes */}
                    <div className="h-[400px]">
                        <NotesPanel videoId={currentVideo.id} initialNotes={currentVideo.notes || ""} />
                    </div>

                    {/* Playlist Content */}
                    <div className="rounded-lg border bg-card">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">Course Content</h3>
                        </div>
                        <div className="h-[400px] overflow-y-auto">
                            {playlist.videos.map((video, index) => (
                                <Link
                                    key={video.id}
                                    href={`/playlist/${slug}/watch?video=${video.id}`}
                                    className={cn(
                                        "flex gap-3 p-3 hover:bg-muted/50 transition-colors border-l-2",
                                        currentVideo!.id === video.id
                                            ? "bg-muted border-primary"
                                            : "border-transparent"
                                    )}
                                >
                                    <div className="flex items-center">
                                        {video.progress[0]?.completed ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <span className="text-sm font-mono text-muted-foreground w-4 text-center">
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={cn(
                                            "text-sm font-medium line-clamp-1",
                                            currentVideo!.id === video.id && "text-primary"
                                        )}>
                                            {video.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {Math.floor((video.duration || 0) / 60)} mins
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
