"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    PenSquare,
    Search,
    MoreVertical,
    Eye,
    Heart,
    Clock,
    Calendar,
    Edit,
    Trash2,
    ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BlogPost {
    id: string
    title: string
    excerpt: string
    content: string
    author: {
        id: string
        name: string
        image?: string
    }
    publishedAt: Date
    readTime: number
    tags: string[]
    views: number
    likes: number
}

interface BlogContentProps {
    posts: BlogPost[]
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date)
}

export function BlogContent({ posts: initialPosts }: BlogContentProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTag, setSelectedTag] = useState<string | null>(null)

    const allTags = [...new Set(posts.flatMap((post) => post.tags))]

    const filteredPosts = posts.filter((post) => {
        const matchesSearch =
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTag = !selectedTag || post.tags.includes(selectedTag)
        return matchesSearch && matchesTag
    })

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
                    <p className="text-muted-foreground">
                        Share your knowledge and learning journey
                    </p>
                </div>
                <Link href="/dashboard/blog/new">
                    <Button className="gap-2">
                        <PenSquare className="h-4 w-4" />
                        New Post
                    </Button>
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={selectedTag === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTag(null)}
                    >
                        All
                    </Button>
                    {allTags.map((tag) => (
                        <Button
                            key={tag}
                            variant={selectedTag === tag ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTag(tag)}
                        >
                            {tag}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <PenSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No posts found</h3>
                    <p className="text-muted-foreground mt-1">
                        {searchQuery || selectedTag
                            ? "Try adjusting your search or filters"
                            : "Start writing your first blog post!"}
                    </p>
                    {!searchQuery && !selectedTag && (
                        <Link href="/dashboard/blog/new" className="mt-4">
                            <Button>Create your first post</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map((post) => (
                        <Card
                            key={post.id}
                            className="group overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                            <Link href={`/dashboard/blog/${post.id}`}>
                                                {post.title}
                                            </Link>
                                        </CardTitle>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 shrink-0"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/blog/${post.id}/edit`}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/blog/${post.id}`} target="_blank">
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    View public
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardDescription className="line-clamp-2 mt-2">
                                    {post.excerpt}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="flex flex-wrap gap-1.5">
                                    {post.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 border-t bg-muted/30">
                                <div className="flex items-center justify-between w-full pt-3">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={post.author.image} />
                                            <AvatarFallback className="text-xs">
                                                {post.author.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(post.publishedAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {post.readTime}m
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {post.views}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Heart className="h-3 w-3" />
                                            {post.likes}
                                        </span>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
