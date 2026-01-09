'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, ExternalLink, PlayCircle, ChevronRight } from 'lucide-react';
import { formatDuration } from '@/lib/playlist-utils';
import { cn } from '@/lib/utils';

interface EmbedContentProps {
    playlist: {
        id: string;
        title: string;
        slug: string;
        coverImageUrl: string | null;
        thumbnail: string | null;
        category: { id: string; name: string } | null;
        videos: Array<{
            id: string;
            title: string;
            thumbnail: string | null;
            duration: number | null;
        }>;
    };
    totalDuration: number;
}

export function EmbedContent({ playlist, totalDuration }: EmbedContentProps) {
    const [selectedVideo, setSelectedVideo] = useState(0);
    const [showPlaylist, setShowPlaylist] = useState(true);

    const currentVideo = playlist.videos[selectedVideo];

    return (
        <div className="absolute inset-0 bg-[#0f0f0f] text-white flex flex-col overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Video Preview */}
                <div className="flex-1 flex flex-col min-w-0">
                    <a
                        href={`/playlist/${playlist.slug}/watch?video=${currentVideo?.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative flex-1 bg-black group flex items-center justify-center"
                    >
                        {currentVideo?.thumbnail ? (
                            <img
                                src={currentVideo.thumbnail}
                                alt={currentVideo.title}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                                <Play className="h-16 w-16 text-white/30" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                <Play className="h-7 w-7 text-white fill-current ml-0.5" />
                            </div>
                        </div>
                    </a>

                    {/* Video Info Bar */}
                    <div className="px-3 py-2 bg-[#1a1a1a] border-t border-white/10 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{currentVideo?.title}</p>
                            <div className="flex items-center gap-2 text-xs text-white/60">
                                <span>{playlist.title}</span>
                                <span>•</span>
                                <span>{selectedVideo + 1}/{playlist.videos.length}</span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 text-xs text-white/80 hover:text-white hover:bg-white/10"
                            asChild
                        >
                            <a
                                href={`/playlist/${playlist.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                Open
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 text-xs text-white/80 hover:text-white hover:bg-white/10 lg:hidden"
                            onClick={() => setShowPlaylist(!showPlaylist)}
                        >
                            <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
                            Playlist
                        </Button>
                    </div>
                </div>

                {/* Playlist sidebar */}
                <div className={cn(
                    "w-56 border-l border-white/10 bg-[#1a1a1a] flex flex-col shrink-0 transition-all",
                    showPlaylist ? "block" : "hidden lg:block"
                )}>
                    <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                        <span className="text-xs font-medium text-white/70">Playlist</span>
                        <span className="text-[10px] text-white/50">{playlist.videos.length} videos</span>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="py-1">
                            {playlist.videos.map((video, index) => (
                                <button
                                    key={video.id}
                                    onClick={() => setSelectedVideo(index)}
                                    className={cn(
                                        "w-full flex gap-2 px-2 py-1.5 text-left transition-colors",
                                        selectedVideo === index
                                            ? "bg-white/10"
                                            : "hover:bg-white/5"
                                    )}
                                >
                                    <div className="relative w-20 aspect-video rounded overflow-hidden bg-black shrink-0">
                                        {video.thumbnail ? (
                                            <img
                                                src={video.thumbnail}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#2a2a2a]">
                                                <Play className="h-3 w-3 text-white/40" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-0.5 right-0.5 bg-black/90 text-white text-[9px] px-0.5 rounded font-mono">
                                            {formatDuration(video.duration || 0)}
                                        </div>
                                        {selectedVideo === index && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                <ChevronRight className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 py-0.5">
                                        <p className={cn(
                                            "text-[11px] font-medium line-clamp-2 leading-tight",
                                            selectedVideo === index ? "text-white" : "text-white/80"
                                        )}>
                                            {index + 1}. {video.title}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-1 border-t border-white/10 bg-[#0f0f0f] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-[10px] text-white/40">
                    <PlayCircle className="h-3 w-3" />
                    <span>{formatDuration(totalDuration)} total</span>
                </div>
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-white/40 hover:text-white/60 transition-colors"
                >
                    Coursioo
                </a>
            </div>
        </div>
    );
}
