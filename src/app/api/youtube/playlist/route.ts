import { NextRequest, NextResponse } from 'next/server';
import { extractYouTubePlaylistId } from '@/lib/playlist-utils';

// GET /api/youtube/playlist?url={playlistUrl}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playlistUrl = searchParams.get('url');

    if (!playlistUrl) {
      return NextResponse.json(
        { error: 'Playlist URL is required' },
        { status: 400 }
      );
    }

    const playlistId = extractYouTubePlaylistId(playlistUrl);
    
    if (!playlistId) {
      return NextResponse.json(
        { error: 'Invalid YouTube playlist URL' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    // Fetch playlist details
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`
    );

    if (!playlistResponse.ok) {
      throw new Error('Failed to fetch playlist details');
    }

    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return NextResponse.json(
        { error: 'Playlist not found or is private' },
        { status: 404 }
      );
    }

    const playlist = playlistData.items[0];

    // Fetch playlist videos
    let videos: any[] = [];
    let nextPageToken = '';

    do {
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${apiKey}`
      );

      if (!videosResponse.ok) {
        throw new Error('Failed to fetch playlist videos');
      }

      const videosData = await videosResponse.json();
      
      // Fetch video durations
      const videoIds = videosData.items.map((item: any) => item.contentDetails.videoId).join(',');
      const durationsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`
      );

      const durationsData = await durationsResponse.json();
      const durationMap = new Map(
        durationsData.items.map((item: any) => [
          item.id,
          parseDuration(item.contentDetails.duration)
        ])
      );

      const processedVideos = videosData.items.map((item: any, index: number) => ({
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
        youtubeId: item.contentDetails.videoId,
        provider: 'YOUTUBE',
        duration: durationMap.get(item.contentDetails.videoId) || 0,
        position: videos.length + index
      }));

      videos = [...videos, ...processedVideos];
      nextPageToken = videosData.nextPageToken || '';
    } while (nextPageToken);

    return NextResponse.json({
      id: playlistId,
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      thumbnail: playlist.snippet.thumbnails?.high?.url || playlist.snippet.thumbnails?.default?.url,
      videos
    });
  } catch (error) {
    console.error('Error fetching YouTube playlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch YouTube playlist' },
      { status: 500 }
    );
  }
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}
