'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShareMenu } from '@/components/share-menu';
import {
  Play,
  Clock,
  Share2,
  Edit,
  Users,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { formatDuration } from '@/lib/playlist-utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaylist();
    fetchUser();
  }, [slug]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUserId(data.userId);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchPlaylist = async () => {
    try {
      const response = await fetch(`/api/playlists?slug=${slug}`);
      if (!response.ok) throw new Error('Playlist not found');
      
      const data = await response.json();
      setPlaylist(data[0]);
    } catch (error: any) {
      toast.error(error.message);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!playlist) {
    return null;
  }

  const isOwner = userId === playlist.userId;
  const totalDuration = playlist.videos.reduce(
    (acc: number, v: any) => acc + (v.duration || 0),
    0
  );

  const visibilityBadge = {
    PUBLIC: { label: 'Public', variant: 'default' as const },
    UNLISTED: { label: 'Unlisted', variant: 'secondary' as const },
    PRIVATE: { label: 'Private', variant: 'outline' as const }
  }[playlist.visibility as 'PUBLIC' | 'UNLISTED' | 'PRIVATE'];

  const difficultyColor = {
    BEGINNER: 'bg-green-500/10 text-green-600 dark:text-green-400',
    INTERMEDIATE: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    ADVANCED: 'bg-red-500/10 text-red-600 dark:text-red-400'
  }[playlist.difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'];


  return (
    <>
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Cover Image */}
          <div className="lg:col-span-1">
            <div className="aspect-video lg:aspect-square rounded-lg overflow-hidden bg-muted">
              {(playlist.coverImageUrl || playlist.thumbnail) ? (
                <img
                  src={playlist.coverImageUrl || playlist.thumbnail}
                  alt={playlist.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Play className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={visibilityBadge.variant}>
                {visibilityBadge.label}
              </Badge>
              {playlist.category && (
                <Badge
                  variant="outline"
                  style={{ borderColor: playlist.category.color }}
                >
                  {playlist.category.name}
                </Badge>
              )}
              {playlist.difficulty && (
                <Badge variant="outline" className={difficultyColor}>
                  {playlist.difficulty.toLowerCase()}
                </Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold">{playlist.title}</h1>

            {playlist.description && (
              <p className="text-muted-foreground">{playlist.description}</p>
            )}

            {playlist.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {playlist.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                {playlist.videos.length} videos
              </div>
              {totalDuration > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatDuration(totalDuration)}
                </div>
              )}
              {playlist.mode === 'YOUTUBE_IMPORT' && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  YouTube Playlist
                </div>
              )}
            </div>

            {typeof playlist.progress === 'number' && playlist.progress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your Progress</span>
                  <span className="font-medium">
                    {playlist.completedVideos}/{playlist.videos.length} completed
                  </span>
                </div>
                <Progress value={playlist.progress} className="h-2" />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button size="lg" asChild>
                <Link href={`/playlist/${slug}/watch`}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Watching
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShareMenuOpen(true)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {isOwner && (
                <Button size="lg" variant="outline" asChild>
                  <Link href={`/playlist/${slug}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Videos List */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Videos</h2>
          <div className="h-[800px]">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-4">
              {playlist.videos.map((video: any, index: number) => (
                <Link
                  key={video.id}
                  href={`/playlist/${slug}/watch?video=${video.id}`}
                  className="block overflow-hidden"
                >
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-all duration-200 hover:shadow-sm overflow-hidden">
                    <div className="flex gap-4 w-full min-w-0">
                      {/* Number/Status */}
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors shrink-0",
                        video.progress?.[0]?.completed
                          ? "border-green-500/50 bg-green-500/10"
                          : "border-muted-foreground/30 bg-muted"
                      )}>
                        {video.progress?.[0]?.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                        )}
                      </div>

                      {/* Thumbnail */}
                      <div className="w-32 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Play className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="font-medium line-clamp-1 text-sm break-words">{video.title}</h3>
                        {video.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 break-words">
                            {video.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          {video.duration && (
                            <span className="flex items-center gap-1 shrink-0">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span className="truncate">{formatDuration(video.duration)}</span>
                            </span>
                          )}
                          {video.dueDate && (
                            <span className="flex items-center gap-1 shrink-0">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span className="truncate">Due {new Date(video.dueDate).toLocaleDateString()}</span>
                            </span>
                          )}
                          {video.provider && video.provider !== 'YOUTUBE' && (
                            <Badge variant="outline" className="h-5 text-xs shrink-0">
                              {video.provider}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      {video.progress?.[0] && (
                        <div className="flex items-center shrink-0 ml-2">
                          {video.progress[0].progressPercent > 0 && (
                            <div className="text-sm text-muted-foreground whitespace-nowrap">
                              {video.progress[0].progressPercent}%
                            </div>
                          )}
                        </div>
                      )}

                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                    </div>
                  </div>
                </Link>
              ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      <ShareMenu
        open={shareMenuOpen}
        onOpenChange={setShareMenuOpen}
        playlistSlug={slug}
        playlistTitle={playlist.title}
      />
    </>
  );
}
