"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, ArrowLeft, MoreVertical, Edit3, MessageSquare, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { formatDistanceToNow } from 'date-fns'

interface VideoWithNotes {
  id: string
  title: string
  notes: string | null
  updatedAt: Date | string
  position: number
}

interface NotesSidebarProps {
  videos: VideoWithNotes[]
  currentVideoId: string
  onNoteSave: (videoId: string, note: string) => Promise<void>
  onVideoSelect: (videoId: string) => void
}

export function NotesSidebar({ videos, currentVideoId, onNoteSave, onVideoSelect }: NotesSidebarProps) {
  const [view, setView] = useState<'list' | 'editor'>('list')
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Editor state
  const [noteContent, setNoteContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Filter videos for list view
  const filteredVideos = useMemo(() => {
    return videos.filter(v =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.notes && v.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [videos, searchQuery])

  // Handle selecting a note from the list
  const handleSelectNote = (videoId: string) => {
    const video = videos.find(v => v.id === videoId)
    if (video) {
      setSelectedVideoId(videoId)
      setNoteContent(video.notes || "")
      setView('editor')
    }
  }

  // Handle back to list
  const handleBack = () => {
    setView('list')
    setSelectedVideoId(null)
  }

  // Handle Create New Note (for current video if not exists?) 
  const handleCreateNote = () => {
    handleSelectNote(currentVideoId)
  }

  // Debounced save for editor
  useEffect(() => {
    if (view !== 'editor' || !selectedVideoId) return

    const timer = setTimeout(() => {
      const video = videos.find(v => v.id === selectedVideoId)
      // Save if content changed
      if (video && noteContent !== (video.notes || "")) {
        saveNote()
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [noteContent, selectedVideoId, view])

  const saveNote = async () => {
    if (!selectedVideoId) return

    setIsSaving(true)
    try {
      await onNoteSave(selectedVideoId, noteContent)
      setLastSaved(new Date())
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  // RENDER LIST VIEW
  if (view === 'list') {
    return (
      <div className="flex flex-col h-full bg-[#0A0A0A] text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <div className="p-1 rounded bg-[#2A2A2A]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
              </div>
              Notes
            </h2>
            <p className="text-[10px] text-white/40">Access all your notes</p>
          </div>
          <div className="flex gap-2">
            {/* Toggle handled by parent, this header is inside the sidebar */}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="p-4 flex gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search notes..."
              className="bg-[#1A1A1A] border-white/10 pl-9 text-xs h-9 focus-visible:ring-1 focus-visible:ring-white/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 bg-[#1A1A1A] border border-white/10 hover:bg-white/10 text-white/70"
            onClick={handleCreateNote}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Notes List */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-2 gap-1">
            {filteredVideos.map(video => {
              const hasNotes = !!video.notes && video.notes.length > 0
              return (
                <button
                  key={video.id}
                  onClick={() => handleSelectNote(video.id)}
                  className={cn(
                    "flex gap-3 p-3 rounded-xl text-left transition-all group",
                    "hover:bg-[#1A1A1A] border border-transparent hover:border-white/5",
                    video.id === currentVideoId && "bg-[#1A1A1A]/50 border-white/5"
                  )}
                >
                  <div className="shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white/90 truncate leading-tight mb-1">
                      {video.position + 1}. {video.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-white/40 truncate max-w-[120px]">
                        {hasNotes ? (video.notes?.slice(0, 30) + "...") : "No notes yet"}
                      </p>
                      <span className="text-[10px] text-white/30 whitespace-nowrap">
                        {formatDistanceToNow(new Date(video.updatedAt), { addSuffix: true }).replace("about ", "")}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
            {filteredVideos.length === 0 && (
              <div className="text-center py-8 text-white/30 text-xs">
                No notes found.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    )
  }

  // RENDER EDITOR VIEW
  const selectedVideo = videos.find(v => v.id === selectedVideoId)
  if (!selectedVideo) return null // Should not happen

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white animate-in slide-in-from-right-5 duration-200">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0 bg-[#0A0A0A]">
        <div className="flex items-center gap-3 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8 -ml-2 text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-medium truncate flex-1" title={selectedVideo.title}>
            {selectedVideo.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#1A1A1A] rounded-md border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-white/50 font-medium">
              {isSaving ? "Saving..." : "Saved"}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1.5 text-white/70 bg-[#1A1A1A] hover:bg-[#252525] border border-white/10">
            <Sparkles className="h-3 w-3" />
            Ask AI
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative bg-[#0A0A0A] group">
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Start typing your notes here..."
          className="w-full h-full resize-none bg-transparent p-6 text-sm leading-relaxed text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-0 border-0 font-sans custom-scrollbar"
          style={{ lineHeight: '1.6' }}
          spellCheck={false}
          autoFocus
        />
        <div className="absolute bottom-3 left-4 text-[10px] text-white/20 select-none">
          Enter text or type '/' for commands
        </div>
      </div>
    </div>
  )
}
