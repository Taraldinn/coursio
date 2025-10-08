import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// POST /api/playlists/[id]/collaborators - Add collaborator
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: playlistId } = await params;
    const { collaboratorUserId, role = 'VIEWER' } = await request.json();

    // Check if requester is owner or admin
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    const isOwner = playlist.userId === userId;
    const requesterCollaborator = await prisma.playlistCollaborator.findUnique({
      where: {
        playlistId_userId: {
          playlistId,
          userId
        }
      }
    });

    if (!isOwner && requesterCollaborator?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only owner or admins can add collaborators' },
        { status: 403 }
      );
    }

    // Add collaborator
    const collaborator = await prisma.playlistCollaborator.create({
      data: {
        playlistId,
        userId: collaboratorUserId,
        role
      }
    });

    return NextResponse.json(collaborator, { status: 201 });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    
return NextResponse.json(
      { error: 'Failed to add collaborator' },
      { status: 500 }
    );
  }
}

// GET /api/playlists/[id]/collaborators - List collaborators
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: playlistId } = await params;

    // Check if user has access to view collaborators
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    const isOwner = playlist.userId === userId;
    const isCollaborator = userId ? await prisma.playlistCollaborator.findUnique({
      where: {
        playlistId_userId: {
          playlistId,
          userId
        }
      }
    }) : null;

    if (!isOwner && !isCollaborator && playlist.visibility === 'PRIVATE') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const collaborators = await prisma.playlistCollaborator.findMany({
      where: { playlistId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    
return NextResponse.json(
      { error: 'Failed to fetch collaborators' },
      { status: 500 }
    );
  }
}
