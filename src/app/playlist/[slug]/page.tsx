import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { Header } from '@/components/header';
import { PlaylistContent } from './playlist-content';
import type { Metadata } from 'next';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const playlist = await prisma.playlist.findFirst({
    where: { slug },
    select: {
      title: true,
      description: true,
      coverImageUrl: true,
      thumbnail: true,
    }
  });

  if (!playlist) {
    return {
      title: 'Playlist Not Found',
    };
  }

  return {
    title: playlist.title,
    description: playlist.description || `Watch ${playlist.title} on Coursioo`,
    openGraph: {
      title: playlist.title,
      description: playlist.description || undefined,
      images: playlist.coverImageUrl || playlist.thumbnail ? [playlist.coverImageUrl || playlist.thumbnail!] : undefined,
    },
  };
}

async function getPlaylist(slug: string, userId: string | null) {
  const playlist = await prisma.playlist.findFirst({
    where: { slug },
    include: {
      category: true,
      videos: {
        orderBy: { position: 'asc' },
        include: {
          progress: userId ? {
            where: { userId },
            select: {
              completed: true,
              completedAt: true,
              progressPercent: true,
              watchedDuration: true
            }
          } : undefined
        }
      }
    }
  });

  if (!playlist) return null;

  // Check visibility permissions
  if (playlist.visibility === 'PRIVATE' && playlist.userId !== userId) {
    if (userId) {
      const collaborator = await prisma.playlistCollaborator.findUnique({
        where: {
          playlistId_userId: {
            playlistId: playlist.id,
            userId
          }
        }
      });
      if (!collaborator) return null;
    } else {
      return null;
    }
  }

  // Calculate progress
  let progress = 0;
  if (userId && playlist.videos.length > 0) {
    const completedCount = playlist.videos.filter(
      (v) => v.progress && v.progress.length > 0 && v.progress[0].completed
    ).length;
    progress = Math.round((completedCount / playlist.videos.length) * 100);
  }

  return {
    ...playlist,
    progress
  };
}

export default async function PlaylistPage({ params }: PageProps) {
  const { slug } = await params;
  const { userId } = await auth();

  const playlist = await getPlaylist(slug, userId);

  if (!playlist) {
    notFound();
  }

  const isOwner = userId === playlist.userId;
  const totalDuration = playlist.videos.reduce(
    (acc, v) => acc + (v.duration || 0),
    0
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <PlaylistContent
        playlist={playlist}
        isOwner={isOwner}
        totalDuration={totalDuration}
      />
    </div>
  );
}
