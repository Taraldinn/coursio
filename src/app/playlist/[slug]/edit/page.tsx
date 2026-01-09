import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { Header } from '@/components/header';
import { EditCourseContent } from './edit-content';
import type { Metadata } from 'next';

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
        title: playlist ? `Edit ${playlist.title}` : 'Edit Course',
    };
}

async function getPlaylist(slug: string, userId: string) {
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
                    description: true,
                    url: true,
                    youtubeId: true,
                    position: true,
                }
            }
        }
    });

    if (!playlist) return null;

    // Check ownership
    if (playlist.userId !== userId) {
        // Check if user is a collaborator with editor role
        const collaborator = await prisma.playlistCollaborator.findUnique({
            where: {
                playlistId_userId: {
                    playlistId: playlist.id,
                    userId
                }
            }
        });
        if (!collaborator || collaborator.role !== 'EDITOR') {
            return null;
        }
    }

    return playlist;
}

async function getCategories() {
    return prisma.category.findMany({
        orderBy: { name: 'asc' }
    });
}

export default async function EditCoursePage({ params }: PageProps) {
    const { slug } = await params;
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const [playlist, categories] = await Promise.all([
        getPlaylist(slug, userId),
        getCategories()
    ]);

    if (!playlist) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <EditCourseContent playlist={playlist} categories={categories} />
        </div>
    );
}
