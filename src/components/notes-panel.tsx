"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save, Loader2, FileText, Command } from "lucide-react"
import { toast } from "sonner"

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
        <div className="flex h-full flex-col bg-[#0A0A0A]">
            <div className="flex-1 relative">
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter text or type '/' for commands"
                    className="w-full h-full resize-none bg-transparent p-4 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-0 leading-relaxed border-0"
                    spellCheck={false}
                />

                {/* Status Indicator Bottom Right */}
                <div className="absolute bottom-4 right-4 text-[10px] text-white/30 flex items-center gap-2 pointer-events-none">
                    {isSaving ? "Saving..." : lastSaved ? "Saved" : ""}
                </div>
            </div>
        </div>
    )
}
