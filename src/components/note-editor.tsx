"use client"

import { useEffect, useState, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { upsertNote } from "@/app/actions/notes"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"

interface NoteEditorProps {
  videoId: string
  initialContent?: string
}

export function NoteEditor({ videoId, initialContent = "" }: NoteEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const debouncedContent = useDebounce(content, 1000)

  const saveNote = useCallback(async (noteContent: string) => {
    if (noteContent === initialContent) return
    
    setIsSaving(true)
    try {
      const result = await upsertNote(videoId, noteContent)
      if (result.error) {
        toast.error("Failed to save note")
      }
    } catch (error) {
      console.error("Error saving note:", error)
    } finally {
      setIsSaving(false)
    }
  }, [videoId, initialContent])

  useEffect(() => {
    if (debouncedContent !== initialContent) {
      saveNote(debouncedContent)
    }
  }, [debouncedContent, initialContent, saveNote])

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="notes">Notes (Markdown supported)</Label>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </div>
        )}
      </div>
      <Textarea
        id="notes"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your notes here... Markdown is supported."
        className="min-h-[300px] flex-1 resize-none font-mono text-sm"
      />
    </div>
  )
}
