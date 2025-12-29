import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ videoId: string }> }
) {
    try {
        const { userId } = await auth();
        const { videoId } = await params;

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { notes } = await request.json();

        // Check if video exists
        const video = await prisma.video.findUnique({
            where: { id: videoId },
        });

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        // Update notes
        // Notes are stored on the Video model in the schema I saw earlier: notes String?
        // Wait, if notes are user-specific, they should be on UserVideoProgress or a separate Note model.
        // The schema showed `notes String?` on `Video` model.
        // video.notes would be global for the video, not per user?
        // Let me checking schema.prisma again.
        // Line 81: notes String? in Model Video.
        // Line 40: userId String in Playlist.
        // If the playlist is owned by the user, then the videos are also "owned" in a way.
        // But if multiple users access the same playlist (e.g. public), they might want their own notes.
        // However, the current schema has `notes` on `Video`, and Playlist has `userId`.
        // It seems the app is designed where users import playlists for themselves?
        // "Playlist" model has "userId".
        // So each import creates a NEW playlist for that user?
        // In `actions/playlist.ts`, `createPlaylistFromYouTube` creates a new Playlist.
        // So yes, `Video` belongs to a `Playlist` which belongs to a `User`.
        // So editing `Video.notes` is safe for that user.

        // Verify ownership
        const playlist = await prisma.playlist.findUnique({
            where: { id: video.playlistId },
        });

        if (!playlist || playlist.userId !== userId) {
            // If collaborator, might be allowed?
            // For now, restrict to owner.
            return NextResponse.json(
                { error: 'Unauthorized to edit notes' },
                { status: 403 }
            );
        }

        const updatedVideo = await prisma.video.update({
            where: { id: videoId },
            data: { notes },
        });

        return NextResponse.json(updatedVideo);
    } catch (error) {
        console.error('Error saving notes:', error);

        return NextResponse.json(
            { error: 'Failed to save notes' },
            { status: 500 }
        );
    }
}
