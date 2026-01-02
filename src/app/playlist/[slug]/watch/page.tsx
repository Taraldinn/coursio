import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { WatchPageClient } from './client-page'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
        <WatchPageClient
            playlist={playlist}
            currentVideo={currentVideo}
            slug={slug}
            userId={userId}
        />
    )
}
