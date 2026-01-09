"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TiptapEditor } from "@/components/tiptap-editor"
import {
    ArrowLeft,
    Save,
    Eye,
    Send,
    X,
    Plus,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function NewBlogPostPage() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [content, setContent] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
    }

    const handleSaveDraft = async () => {
        if (!title.trim()) {
            toast.error("Please add a title")
            return
        }

        setIsSaving(true)
        try {
            // TODO: Save to database
            await new Promise((r) => setTimeout(r, 500))
            toast.success("Draft saved!")
        } catch {
            toast.error("Failed to save draft")
        } finally {
            setIsSaving(false)
        }
    }

    const handlePublish = async () => {
        if (!title.trim()) {
            toast.error("Please add a title")
            return
        }
        if (!content.trim()) {
            toast.error("Please add some content")
            return
        }

        setIsPublishing(true)
        try {
            // TODO: Publish to database
            await new Promise((r) => setTimeout(r, 500))
            toast.success("Post published!")
            router.push("/dashboard/blog")
        } catch {
            toast.error("Failed to publish")
        } finally {
            setIsPublishing(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/blog">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-medium">New Blog Post</h1>
                            <p className="text-xs text-muted-foreground">Draft</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                        >
                            <Save className="h-4 w-4" />
                            {isSaving ? "Saving..." : "Save Draft"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 hidden sm:flex"
                        >
                            <Eye className="h-4 w-4" />
                            Preview
                        </Button>
                        <Button
                            size="sm"
                            className="gap-2"
                            onClick={handlePublish}
                            disabled={isPublishing}
                        >
                            <Send className="h-4 w-4" />
                            {isPublishing ? "Publishing..." : "Publish"}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
                <div className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Post title..."
                            className="border-none text-3xl font-bold tracking-tight placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0 h-auto py-2"
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                        <Label htmlFor="excerpt" className="text-sm text-muted-foreground">
                            Excerpt (optional)
                        </Label>
                        <Input
                            id="excerpt"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="A brief description of your post..."
                            className="text-muted-foreground"
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Tags</Label>
                        <div className="flex flex-wrap gap-2 items-center">
                            {tags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="gap-1 pr-1"
                                >
                                    {tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="ml-1 rounded-full hover:bg-foreground/10 p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            <div className="flex items-center gap-1">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            addTag()
                                        }
                                    }}
                                    placeholder="Add tag..."
                                    className="h-7 w-24 text-xs"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={addTag}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Content</Label>
                        <div className="min-h-[400px] rounded-lg border bg-background">
                            <TiptapEditor
                                value={content}
                                onChange={setContent}
                                placeholder="Start writing your post..."
                                minHeight="400px"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
