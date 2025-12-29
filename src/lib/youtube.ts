export async function fetchYouTubePlaylist(playlistId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    throw new Error("YouTube API key not configured")
  }

  try {
    // Fetch playlist details
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    )

    if (!playlistResponse.ok) {
      throw new Error("Failed to fetch playlist")
    }

    const playlistData = await playlistResponse.json()

    if (!playlistData.items || playlistData.items.length === 0) {
      throw new Error("Playlist not found")
    }

    const playlist = playlistData.items[0]

    // Fetch ALL playlist items (videos) with pagination
    let allVideos: any[] = []
    let nextPageToken: string | undefined = undefined

    do {
      const url: string = nextPageToken
        ? `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&pageToken=${nextPageToken}&key=${apiKey}`
        : `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}`

      const videosResponse = await fetch(url, { next: { revalidate: 3600 } })

      if (!videosResponse.ok) {
        throw new Error("Failed to fetch playlist videos")
      }

      const videosData = await videosResponse.json()
      allVideos = allVideos.concat(videosData.items)
      nextPageToken = videosData.nextPageToken
    } while (nextPageToken)

    // Fetch video durations in batches (max 50 IDs per request)
    const durationMap = new Map()
    const videoIds = allVideos.map((item: any) => item.contentDetails.videoId)

    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50).join(',')
      const durationsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batch}&key=${apiKey}`,
        { next: { revalidate: 3600 } }
      )

      const durationsData = await durationsResponse.json()
      durationsData.items.forEach((item: any) => {
        durationMap.set(item.id, parseDuration(item.contentDetails.duration))
      })
    }

    return {
      id: playlistId,
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      thumbnail: playlist.snippet.thumbnails?.high?.url || playlist.snippet.thumbnails?.default?.url,
      videos: allVideos.map((item: any, index: number) => ({
        youtubeId: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
        position: index,
        duration: durationMap.get(item.contentDetails.videoId) || 0,
      })),
    }
  } catch (error) {
    console.error("Error fetching YouTube playlist:", error)
    throw error
  }
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  return hours * 3600 + minutes * 60 + seconds
}

export function extractYouTubePlaylistId(url: string): string | null {
  const patterns = [
    /[?&]list=([^#&?]+)/,
    /youtube\.com\/playlist\?list=([^#&?]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^#&?]+)/,
    /youtube\.com\/embed\/([^#&?]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}
