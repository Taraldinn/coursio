import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

export const getDashboardStats = unstable_cache(
    async (userId: string) => {
        // Get all playlists with progress
        const playlists = await prisma.playlist.findMany({
            where: {
                userId,
            },
            include: {
                videos: {
                    include: {
                        progress: {
                            where: {
                                userId,
                            },
                        },
                    },
                },
                category: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        // Calculate statistics
        const totalPlaylists = playlists.length;

        const allVideos = playlists.flatMap((p: any) => p.videos);
        const totalVideos = allVideos.length;

        // We need to type cast or be careful with the included relation
        const completedVideos = allVideos.filter((v: any) => v.progress[0]?.completed).length;
        const totalWatchTime = allVideos.reduce(
            (sum: number, v: any) => sum + (v.progress[0]?.watchedDuration || 0),
            0
        );

        // Active playlists (with at least one video started)
        const activePlaylistsCount = playlists.filter((p: any) =>
            p.videos.some((v: any) => v.progress.length > 0)
        ).length;

        // Weekly stats (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weeklyProgress = await prisma.userVideoProgress.findMany({
            where: {
                userId,
                updatedAt: {
                    gte: weekAgo,
                },
            },
        });

        const weeklyWatchTime = weeklyProgress.reduce((sum: number, p: any) => sum + p.watchedDuration, 0);
        const weeklyCompletedVideos = weeklyProgress.filter((p: any) => p.completed).length;

        // Continue Learning Playlists
        const continueLearningPlaylists = playlists
            .map((playlist: any) => {
                const totalCount = playlist.videos.length;
                const completedVideoCount = playlist.videos.filter((v: any) => v.progress[0]?.completed).length;
                const progress = totalCount > 0 ? Math.round((completedVideoCount / totalCount) * 100) : 0;

                return {
                    id: playlist.id,
                    title: playlist.title,
                    description: playlist.description,
                    thumbnail: playlist.thumbnail,
                    category: playlist.category,
                    videos: playlist.videos,
                    completedCount: completedVideoCount,
                    totalCount,
                    progress,
                };
            })
            .filter(p => p.progress > 0 && p.progress < 100)
            .slice(0, 3);

        return {
            playlists,
            totalPlaylists,
            totalVideos,
            completedVideos,
            totalWatchTime,
            activePlaylistsCount,
            weeklyWatchTime,
            weeklyCompletedVideos,
            continueLearningPlaylists
        };
    },
    ['dashboard-stats'], // Cache key
    {
        revalidate: 300, // Revalidate every 5 minutes
        tags: ['dashboard'],
    }
);
