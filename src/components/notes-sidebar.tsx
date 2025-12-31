"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Cloud, Download, X } from "lucide-react"
import { EnhancedNoteEditor } from "@/components/enhanced-note-editor"

interface NotesSidebarProps {
  videoId: string
  initialContent: string
}

export function NotesSidebar({ videoId, initialContent }: NotesSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Take Notes</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Cloud className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <EnhancedNoteEditor
            videoId={videoId}
            initialContent={initialContent}
          />
        </div>
      </ScrollArea>
    </div>
  )
}

