"use client"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save, Loader2, FileText } from "lucide-react"
import { toast } from "sonner"
// optional: import ReactMarkdown if we want previews, but simple text area is fine for now

interface NotesPanelProps {
    videoId: string
    initialNotes?: string
}

export function NotesPanel({ videoId, initialNotes = "" }: NotesPanelProps) {
    const [notes, setNotes] = useState(initialNotes)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    // Debounce save
    useEffect(() => {
        const timer = setTimeout(() => {
            if (notes !== initialNotes) {
                handleSave()
            }
        }, 2000)

        return () => clearTimeout(timer)
    }, [notes, videoId])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await fetch(`/api/videos/${videoId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes }),
            })

            if (!response.ok) throw new Error("Failed to save notes")

            setLastSaved(new Date())
        } catch (error) {
            toast.error("Failed to save notes")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex h-full flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                    <FileText className="h-5 w-5" />
                    <h3>Notes</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {isSaving ? (
                        <span className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Saving...
                        </span>
                    ) : lastSaved ? (
                        <span>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    ) : null}
                </div>
            </div>

            <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type your notes here... (Markdown supported)"
                className="flex-1 resize-none font-mono text-sm leading-relaxed"
            />

            <div className="flex justify-end">
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notes
                </Button>
            </div>
        </div>
    )
}
