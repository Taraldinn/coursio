"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
    MessageSquare,
    Send,
    ThumbsUp,
    Reply,
    MoreHorizontal,
    X
} from "lucide-react"

interface Comment {
    id: string
    userId: string
    userName: string
    userImage?: string
    content: string
    createdAt: Date
    likes: number
    isLiked: boolean
    replies?: Comment[]
}

interface DiscussionSidebarProps {
    videoId: string
    isOpen: boolean
    onClose: () => void
}

// Mock data - replace with actual API calls
const mockComments: Comment[] = [
    {
        id: "1",
        userId: "user1",
        userName: "John Doe",
        content: "This explanation was super helpful! Thanks for breaking it down step by step.",
        createdAt: new Date(Date.now() - 3600000),
        likes: 12,
        isLiked: false,
        replies: [
            {
                id: "1-1",
                userId: "user2",
                userName: "Jane Smith",
                content: "Agreed! The visual examples really helped.",
                createdAt: new Date(Date.now() - 1800000),
                likes: 3,
                isLiked: true,
            }
        ]
    },
    {
        id: "2",
        userId: "user3",
        userName: "Alex Johnson",
        content: "Could someone explain the part at 5:32? I'm a bit confused about the concept.",
        createdAt: new Date(Date.now() - 7200000),
        likes: 5,
        isLiked: false,
    }
]

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
}

function CommentItem({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) {
    const [showReplies, setShowReplies] = useState(false)
    const [liked, setLiked] = useState(comment.isLiked)
    const [likeCount, setLikeCount] = useState(comment.likes)

    const handleLike = () => {
        setLiked(!liked)
        setLikeCount(prev => liked ? prev - 1 : prev + 1)
    }

    return (
        <div className={cn("group", isReply ? "ml-10" : "")}>
            <div className="flex gap-3 py-3">
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={comment.userImage} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {comment.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white/90">{comment.userName}</span>
                        <span className="text-xs text-white/40">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-white/70 mt-1 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={handleLike}
                            className={cn(
                                "flex items-center gap-1 text-xs transition-colors",
                                liked ? "text-primary" : "text-white/40 hover:text-white/60"
                            )}
                        >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            {likeCount > 0 && <span>{likeCount}</span>}
                        </button>
                        {!isReply && (
                            <button className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors">
                                <Reply className="h-3.5 w-3.5" />
                                Reply
                            </button>
                        )}
                        <button className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white/60 transition-all">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    {comment.replies && comment.replies.length > 0 && !isReply && (
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="text-xs text-primary hover:text-primary/80 mt-2 transition-colors"
                        >
                            {showReplies ? "Hide" : "View"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                        </button>
                    )}
                </div>
            </div>
            {showReplies && comment.replies?.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply />
            ))}
        </div>
    )
}

export function DiscussionSidebar({ videoId, isOpen, onClose }: DiscussionSidebarProps) {
    const [newComment, setNewComment] = useState("")
    const [comments, setComments] = useState<Comment[]>(mockComments)

    const handleSubmit = () => {
        if (!newComment.trim()) return

        const comment: Comment = {
            id: Date.now().toString(),
            userId: "current-user",
            userName: "You",
            content: newComment,
            createdAt: new Date(),
            likes: 0,
            isLiked: false,
        }

        setComments([comment, ...comments])
        setNewComment("")
    }

    return (
        <div
            className={cn(
                "border-l border-white/10 bg-[#0A0A0A] flex flex-col transition-all duration-300 overflow-hidden",
                isOpen ? "w-96" : "w-0"
            )}
        >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-white/10">
                        <MessageSquare className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold">Discussion</span>
                    <span className="text-xs text-white/40 ml-1">({comments.length})</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10"
                    onClick={onClose}
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Comment Input */}
            <div className="p-4 border-b border-white/10">
                <div className="relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add to the discussion..."
                        className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                handleSubmit()
                            }
                        }}
                    />
                    <Button
                        size="sm"
                        className="absolute bottom-2 right-2 h-7 px-3 gap-1.5"
                        onClick={handleSubmit}
                        disabled={!newComment.trim()}
                    >
                        <Send className="h-3.5 w-3.5" />
                        Post
                    </Button>
                </div>
                <p className="text-[10px] text-white/30 mt-1.5">Press ⌘+Enter to post</p>
            </div>

            {/* Comments List */}
            <ScrollArea className="flex-1">
                <div className="px-4 divide-y divide-white/5">
                    {comments.length === 0 ? (
                        <div className="py-12 text-center">
                            <MessageSquare className="h-10 w-10 text-white/20 mx-auto mb-3" />
                            <p className="text-sm text-white/40">No comments yet</p>
                            <p className="text-xs text-white/30 mt-1">Be the first to start the discussion!</p>
                        </div>
                    ) : (
                        comments.map(comment => (
                            <CommentItem key={comment.id} comment={comment} />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
