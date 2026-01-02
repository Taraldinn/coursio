"use client"

import { NotesSidebar } from "@/components/notes-sidebar"

interface NotesSidebarConnectorProps {
    videos: any[]
    currentVideoId: string
}

export function NotesSidebarConnector({ videos, currentVideoId }: NotesSidebarConnectorProps) {
    const handleNoteSave = async (videoId: string, note: string) => {
        try {
            const response = await fetch(`/api/videos/${videoId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: note }),
            })

            if (!response.ok) throw new Error("Failed to save notes")
        } catch (error) {
            console.error("Failed to save note", error)
            // Ideally assume success for mock mode or show toast error
        }
    }

    return (
        <NotesSidebar
            videos={videos}
            currentVideoId={currentVideoId}
            onNoteSave={handleNoteSave}
            onVideoSelect={(id) => {
                // Optional navigation handling if needed
            }}
        />
    )
}
