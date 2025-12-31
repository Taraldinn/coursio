'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  MoreVertical,
  PlayCircle
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
      <div className="flex items-center justify-center min-h-screen bg-background">
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
        {/* Background Blur */}
        <div className="absolute inset-0 z-0">
          {playlist.coverImageUrl || playlist.thumbnail ? (
            <img
              src={playlist.coverImageUrl || playlist.thumbnail}
              className="w-full h-full object-cover opacity-30 blur-3xl scale-110"
              alt="Background"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="container relative z-10 h-full flex flex-col justify-end pb-12 px-6 mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            {/* Cover Image */}
            <div className="w-full max-w-[300px] aspect-video md:aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
              {playlist.coverImageUrl || playlist.thumbnail ? (
                <img
                  src={playlist.coverImageUrl || playlist.thumbnail}
                  alt={playlist.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted/20 backdrop-blur-md">
                  <PlayCircle className="h-20 w-20 text-white/50" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 text-white">
              <div className="flex flex-wrap gap-2">
                {playlist.category && (
                  <Badge className="bg-primary/20 hover:bg-primary/30 text-primary border-0 text-xs backdrop-blur-md">
                    {playlist.category.name}
                  </Badge>
                )}
                {playlist.difficulty && (
                  <Badge variant="outline" className="border-white/20 text-white/80 text-xs">
                    {playlist.difficulty}
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0 text-xs backdrop-blur-md">
                  {formatDuration(totalDuration)}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                {playlist.title}
              </h1>

              {playlist.description && (
                <p className="text-lg text-white/70 max-w-2xl line-clamp-2">
                  {playlist.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-xl shadow-primary/20" asChild>
                  <Link href={`/playlist/${slug}/watch`}>
                    <Play className="h-5 w-5 mr-2 fill-current" />
                    Start Watching
                  </Link>
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-12 bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"
                  onClick={() => setShareMenuOpen(true)}
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
                {isOwner && (
                  <Button variant="secondary" size="lg" className="h-12 bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md" asChild>
                    <Link href={`/playlist/${slug}/edit`}>
                      <Edit className="h-5 w-5 mr-2" />
                      Edit Course
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Course Content
              <Badge variant="secondary" className="rounded-full px-2.5">
                {playlist.videos.length}
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              {typeof playlist.progress === 'number' && playlist.progress > 0
                ? `${playlist.progress}% Completed`
                : "Not started"}
            </p>
          </div>

          <div className="grid gap-2">
            {playlist.videos.map((video: any, index: number) => (
              <Link
                key={video.id}
                href={`/playlist/${slug}/watch?video=${video.id}`}
                className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-card/80 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
              >
                {/* Thumbnail (small) */}
                <div className="relative w-full sm:w-40 aspect-video rounded-lg overflow-hidden bg-black/20 shrink-0">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Play className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <PlayCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-mono">
                    {formatDuration(video.duration || 0)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {index + 1}. {video.title}
                    </h3>
                    {video.progress?.[0]?.completed && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                    {video.description || "No description available."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <ShareMenu
        open={shareMenuOpen}
        onOpenChange={setShareMenuOpen}
        playlistSlug={slug}
        playlistTitle={playlist.title}
      />
    </div>
  );
}
