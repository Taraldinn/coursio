'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Youtube, Link as LinkIcon, Upload, Loader2, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface PlaylistFormProps {
  categories?: { id: string; name: string }[];
}

export function PlaylistForm({ categories = [] }: PlaylistFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'youtube' | 'custom'>('youtube');
  const [loading, setLoading] = useState(false);
  const [loadingYouTube, setLoadingYouTube] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [videos, setVideos] = useState<any[]>([]);

  // Fetch YouTube playlist
  const fetchYouTubePlaylist = async () => {
    if (!youtubeUrl) {
      toast.error('Please enter a YouTube playlist URL');
      
return;
    }

    setLoadingYouTube(true);
    try {
      const response = await fetch(
        `/api/youtube/playlist?url=${encodeURIComponent(youtubeUrl)}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch playlist');
      }

      const data = await response.json();
      setTitle(data.title);
      setDescription(data.description);
      setThumbnail(data.thumbnail);
      setVideos(data.videos);
      
      toast.success(`Imported ${data.videos.length} videos from YouTube`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingYouTube(false);
    }
  };

  // Add custom video
  const addCustomVideo = () => {
    setVideos([
      ...videos,
      { title: '', url: '', thumbnail: '', description: '', provider: 'YOUTUBE' }
    ]);
  };

  // Remove video
  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  // Update video
  const updateVideo = (index: number, field: string, value: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], [field]: value };
    setVideos(updated);
  };

  // Upload cover image
  const uploadCoverImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setCoverImageUrl(data.url);
      toast.success('Cover image uploaded');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Add tag
  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error('Title is required');
      
return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          mode: mode === 'youtube' ? 'YOUTUBE_IMPORT' : 'CUSTOM',
          youtubePlaylistId: mode === 'youtube' ? youtubeUrl : null,
          categoryId: categoryId || null,
          tags,
          difficulty: difficulty || null,
          visibility,
          coverImageUrl: coverImageUrl || thumbnail,
          videos: mode === 'custom' ? videos : []
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create playlist');
      }

      const playlist = await response.json();
      toast.success('Playlist created successfully!');
      router.push(`/playlist/${playlist.slug}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'youtube' | 'custom')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="youtube" className="gap-2">
            <Youtube className="h-4 w-4" />
            YouTube Import
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <LinkIcon className="h-4 w-4" />
            Custom Playlist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="youtube" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube Playlist URL</Label>
            <div className="flex gap-2">
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/playlist?list=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={fetchYouTubePlaylist}
                disabled={loadingYouTube}
              >
                {loadingYouTube ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Fetch'
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a public or unlisted YouTube playlist URL to automatically import all videos
            </p>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Videos</Label>
              <Button type="button" size="sm" onClick={addCustomVideo}>
                <Plus className="h-4 w-4 mr-1" />
                Add Video
              </Button>
            </div>
            
            {videos.length === 0 ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                <LinkIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No videos added yet</p>
                <p className="text-xs mt-1">Click "Add Video" to start building your playlist</p>
              </div>
            ) : (
              <div className="space-y-3">
                {videos.map((video, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Input
                        placeholder="Video title"
                        value={video.title}
                        onChange={(e) => updateVideo(index, 'title', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVideo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Video URL (YouTube, Vimeo, or direct link)"
                      value={video.url}
                      onChange={(e) => updateVideo(index, 'url', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Common fields */}
      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="My Awesome Playlist"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what this playlist is about..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag (e.g., Frontend, DSA)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" onClick={addTag} size="sm">
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">Public - Anyone can view</SelectItem>
              <SelectItem value="UNLISTED">Unlisted - Only with link</SelectItem>
              <SelectItem value="PRIVATE">Private - Only you and collaborators</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover">Custom Cover Image</Label>
          <div className="flex items-center gap-4">
            {(coverImageUrl || thumbnail) && (
              <img
                src={coverImageUrl || thumbnail}
                alt="Cover preview"
                className="h-20 w-20 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadCoverImage(file);
                }}
                disabled={uploadingImage}
              />
              {uploadingImage && (
                <p className="text-xs text-muted-foreground mt-1">
                  Uploading...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Playlist'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
