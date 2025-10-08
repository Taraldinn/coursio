import prisma from '@/lib/prisma';

/**
 * Generate a unique slug from title
 */
export async function generateSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check for uniqueness
  while (await prisma.playlist.findFirst({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Generate shareable link from slug
 */
export function generateShareableLink(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/playlist/${slug}`;
}

/**
 * Generate QR code URL using QR Server API
 */
export function generateQRCodeUrl(url: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
}

/**
 * Generate embed code for playlist
 */
export function generateEmbedCode(slug: string, width = 560, height = 315): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `<iframe src="${baseUrl}/embed/${slug}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;
}

/**
 * Extract YouTube playlist ID from URL
 */
export function extractYouTubePlaylistId(url: string): string | null {
  const patterns = [
    /[?&]list=([^&#]+)/,
    /youtube\.com\/playlist\?list=([^&#]+)/,
    /youtu\.be\/playlist\?list=([^&#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&#?]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
export function extractVimeoVideoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Detect video provider from URL
 */
export function detectVideoProvider(url: string): 'YOUTUBE' | 'VIMEO' | 'DIRECT' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'YOUTUBE';
  }
  if (url.includes('vimeo.com')) {
    return 'VIMEO';
  }
  return 'DIRECT';
}

/**
 * Validate video URL
 */
export function isValidVideoUrl(url: string): boolean {
  try {
    new URL(url);
    const provider = detectVideoProvider(url);
    
    if (provider === 'YOUTUBE') {
      return extractYouTubeVideoId(url) !== null;
    }
    if (provider === 'VIMEO') {
      return extractVimeoVideoId(url) !== null;
    }
    // For direct links, just check if it's a valid URL
    return true;
  } catch {
    return false;
  }
}

/**
 * Format duration from seconds to readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate playlist total duration
 */
export function calculateTotalDuration(videos: { duration?: number | null }[]): number {
  return videos.reduce((total, video) => total + (video.duration || 0), 0);
}
