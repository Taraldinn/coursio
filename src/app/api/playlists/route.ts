import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { generateSlug, generateShareableLink } from '@/lib/playlist-utils';

// GET /api/playlists - List all playlists for current user or public playlists
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    
    const filter = searchParams.get('filter'); // 'my' | 'public' | 'shared'
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');

    const where: any = {};

    // Filter logic
    if (filter === 'my' && userId) {
      where.userId = userId;
    } else if (filter === 'shared' && userId) {
      where.collaborators = {
        some: { userId }
      };
    } else if (filter === 'public' || !userId) {
      where.visibility = 'PUBLIC';
    }

    // Additional filters
    if (category) where.categoryId = category;
    if (tags && tags.length > 0) where.tags = { hasSome: tags };
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const playlists = await prisma.playlist.findMany({
      where,
      include: {
        category: true,
        videos: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            duration: true,
          },
          orderBy: { position: 'asc' }
        },
        collaborators: userId ? {
          where: { userId },
          select: { role: true }
        } : false,
        _count: {
          select: { videos: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate progress for each playlist if user is logged in
    if (userId) {
      const playlistsWithProgress = await Promise.all(
        playlists.map(async (playlist) => {
          const totalVideos = playlist._count.videos;
          if (totalVideos === 0) {
            return { ...playlist, progress: 0, completedVideos: 0 };
          }

          const completedCount = await prisma.userVideoProgress.count({
            where: {
              userId,
              completed: true,
              video: { playlistId: playlist.id }
            }
          });

          return {
            ...playlist,
            progress: Math.round((completedCount / totalVideos) * 100),
            completedVideos: completedCount
          };
        })
      );

      return NextResponse.json(playlistsWithProgress);
    }

    return NextResponse.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    
return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

// POST /api/playlists - Create new playlist
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      mode,
      youtubePlaylistId,
      categoryId,
      tags,
      difficulty,
      visibility,
      coverImageUrl,
      videos
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = await generateSlug(title);
    const shareableLink = generateShareableLink(slug);

    // Create playlist
    const playlist = await prisma.playlist.create({
      data: {
        title,
        description,
        mode: mode || 'CUSTOM',
        slug,
        shareableLink,
        youtubePlaylistId,
        userId,
        categoryId,
        tags: tags || [],
        difficulty,
        visibility: visibility || 'PUBLIC',
        coverImageUrl,
        // Create videos if provided (for custom playlists)
        videos: videos ? {
          create: videos.map((video: any, index: number) => ({
            title: video.title,
            url: video.url,
            thumbnail: video.thumbnail,
            description: video.description,
            youtubeId: video.youtubeId,
            provider: video.provider || 'YOUTUBE',
            duration: video.duration,
            position: index,
            dueDate: video.dueDate
          }))
        } : undefined
      },
      include: {
        category: true,
        videos: true,
        _count: {
          select: { videos: true }
        }
      }
    });

    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    
return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
}
