import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET /api/playlists/[id] - Get playlist by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const { id } = params;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        category: true,
        videos: {
          orderBy: { position: 'asc' },
          include: userId ? {
            progress: {
              where: { userId },
              select: {
                completed: true,
                completedAt: true,
                progressPercent: true,
                watchedDuration: true
              }
            }
          } : false
        }
      }
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Check visibility permissions
    if (playlist.visibility === 'PRIVATE' && playlist.userId !== userId) {
      // Check if user is a collaborator
      if (userId) {
        const collaborator = await prisma.playlistCollaborator.findUnique({
          where: {
            playlistId_userId: {
              playlistId: id,
              userId
            }
          }
        });

        if (!collaborator) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    );
  }
}

// PATCH /api/playlists/[id] - Update playlist
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Check ownership or editor permission
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        collaborators: {
          where: { userId }
        }
      }
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    const isOwner = playlist.userId === userId;
    const isEditor = playlist.collaborators.some(
      c => c.role === 'EDITOR' || c.role === 'ADMIN'
    );

    if (!isOwner && !isEditor) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update playlist
    const updated = await prisma.playlist.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      },
      include: {
        category: true,
        videos: true
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/playlists/[id] - Delete playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id }
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    if (playlist.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - only owner can delete' },
        { status: 403 }
      );
    }

    // Delete playlist (cascades to videos)
    await prisma.playlist.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}
