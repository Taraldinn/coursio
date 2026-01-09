'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Save,
    ArrowLeft,
    Trash2,
    GripVertical,
    Play,
    Image as ImageIcon,
    Loader2,
    Eye,
    EyeOff,
    Globe,
    Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatDuration } from '@/lib/playlist-utils';

interface EditCourseContentProps {
    playlist: {
        id: string;
        title: string;
        description: string | null;
        slug: string;
        coverImageUrl: string | null;
        thumbnail: string | null;
        difficulty: string | null;
        visibility: string;
        categoryId: string | null;
        tags: string[];
        videos: Array<{
            id: string;
            title: string;
            thumbnail: string | null;
            duration: number | null;
            description: string | null;
            url: string;
            youtubeId: string | null;
            position: number;
        }>;
    };
    categories: Array<{
        id: string;
        name: string;
    }>;
}

export function EditCourseContent({ playlist, categories }: EditCourseContentProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Form state
    const [title, setTitle] = useState(playlist.title);
    const [description, setDescription] = useState(playlist.description || '');
    const [categoryId, setCategoryId] = useState(playlist.categoryId || '');
    const [difficulty, setDifficulty] = useState(playlist.difficulty || '');
    const [visibility, setVisibility] = useState(playlist.visibility);
    const [coverImageUrl, setCoverImageUrl] = useState(playlist.coverImageUrl || '');
    const [tags, setTags] = useState<string[]>(playlist.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [videos, setVideos] = useState(playlist.videos);

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`/api/playlists/${playlist.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    categoryId: categoryId || null,
                    difficulty: difficulty || null,
                    visibility,
                    coverImageUrl: coverImageUrl || null,
                    tags,
                    videos: videos.map((v, i) => ({
                        id: v.id,
                        title: v.title,
                        description: v.description,
                        position: i,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save');
            }

            toast.success('Course saved successfully');
            router.refresh();
        } catch (error) {
            toast.error('Failed to save course');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const response = await fetch(`/api/playlists/${playlist.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete');
            }

            toast.success('Course deleted');
            router.push('/dashboard/playlists');
        } catch (error) {
            toast.error('Failed to delete course');
        } finally {
            setDeleting(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const updateVideoTitle = (videoId: string, newTitle: string) => {
        setVideos(videos.map(v => v.id === videoId ? { ...v, title: newTitle } : v));
    };

    const updateVideoDescription = (videoId: string, newDescription: string) => {
        setVideos(videos.map(v => v.id === videoId ? { ...v, description: newDescription } : v));
    };

    const deleteVideo = async (videoId: string) => {
        try {
            const response = await fetch(`/api/videos/${videoId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setVideos(videos.filter(v => v.id !== videoId));
                toast.success('Video removed');
            } else {
                toast.error('Failed to remove video');
            }
        } catch {
            toast.error('Failed to remove video');
        }
    };

    const moveVideo = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= videos.length) return;

        const newVideos = [...videos];
        [newVideos[index], newVideos[newIndex]] = [newVideos[newIndex], newVideos[index]];
        setVideos(newVideos);
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/playlist/${playlist.slug}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Course</h1>
                        <p className="text-muted-foreground text-sm">Make changes to your course</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/playlist/${playlist.slug}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </Link>
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Update your course title and description</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Course Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter course title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your course..."
                                    rows={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="coverImage">Cover Image URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="coverImage"
                                        value={coverImageUrl}
                                        onChange={(e) => setCoverImageUrl(e.target.value)}
                                        placeholder="https://..."
                                    />
                                    {coverImageUrl && (
                                        <div className="w-20 h-12 rounded overflow-hidden border shrink-0">
                                            <img src={coverImageUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Videos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Content</CardTitle>
                            <CardDescription>{videos.length} videos in this course</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[500px]">
                                <div className="space-y-2 pr-4">
                                    {videos.map((video, index) => (
                                        <div
                                            key={video.id}
                                            className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => moveVideo(index, 'up')}
                                                    disabled={index === 0}
                                                >
                                                    <GripVertical className="h-4 w-4 rotate-180" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => moveVideo(index, 'down')}
                                                    disabled={index === videos.length - 1}
                                                >
                                                    <GripVertical className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="relative w-24 aspect-video rounded overflow-hidden bg-muted shrink-0">
                                                {video.thumbnail ? (
                                                    <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Play className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] px-1 rounded font-mono">
                                                    {formatDuration(video.duration || 0)}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-2">
                                                <Input
                                                    value={video.title}
                                                    onChange={(e) => updateVideoTitle(video.id, e.target.value)}
                                                    className="h-8 text-sm font-medium"
                                                    placeholder="Video title"
                                                />
                                                <Input
                                                    value={video.description || ''}
                                                    onChange={(e) => updateVideoDescription(video.id, e.target.value)}
                                                    className="h-8 text-xs"
                                                    placeholder="Video description (optional)"
                                                />
                                            </div>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove video?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will remove "{video.title}" from the course. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deleteVideo(video.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
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
                                <Label>Difficulty</Label>
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

                            <div className="space-y-2">
                                <Label>Visibility</Label>
                                <Select value={visibility} onValueChange={setVisibility}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PUBLIC">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4" />
                                                Public
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="UNLISTED">
                                            <div className="flex items-center gap-2">
                                                <EyeOff className="h-4 w-4" />
                                                Unlisted
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="PRIVATE">
                                            <div className="flex items-center gap-2">
                                                <Lock className="h-4 w-4" />
                                                Private
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tags</CardTitle>
                            <CardDescription>Add tags to help users find your course</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add a tag..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTag();
                                        }
                                    }}
                                />
                                <Button variant="outline" onClick={addTag}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="gap-1">
                                        {tag}
                                        <button
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full" disabled={deleting}>
                                        {deleting ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4 mr-2" />
                                        )}
                                        Delete Course
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your course and all associated data including progress and notes.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
