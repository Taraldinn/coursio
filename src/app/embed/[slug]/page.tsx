import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { EmbedContent } from './embed-content';
import type { Metadata } from 'next';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;

    const playlist = await prisma.playlist.findFirst({
        where: { slug },
        select: { title: true }
    });

    return {
        title: playlist?.title || 'Embedded Playlist',
    };
}

async function getPlaylist(slug: string) {
    const playlist = await prisma.playlist.findFirst({
        where: { slug },
        include: {
            category: true,
            videos: {
                orderBy: { position: 'asc' },
                select: {
                    id: true,
                    title: true,
                    thumbnail: true,
                    duration: true,
                }
            }
        }
    });

    if (!playlist) return null;

    // Only show public playlists in embed
    if (playlist.visibility === 'PRIVATE') {
        return null;
    }

    return playlist;
}

export default async function EmbedPage({ params }: PageProps) {
    const { slug } = await params;
    const playlist = await getPlaylist(slug);

    if (!playlist) {
        notFound();
    }

    const totalDuration = playlist.videos.reduce(
        (acc, v) => acc + (v.duration || 0),
        0
    );

    return <EmbedContent playlist={playlist} totalDuration={totalDuration} />;
}
