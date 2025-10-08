"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { EnhancedNoteEditor } from "@/components/enhanced-note-editor"

interface CollapsibleNotesProps {
  videoId: string
  initialContent: string
}

export function CollapsibleNotes({ videoId, initialContent }: CollapsibleNotesProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-lg border bg-card shadow-sm"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">Notes</h3>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle notes</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="px-4 pb-4">
        <EnhancedNoteEditor 
          videoId={videoId} 
          initialContent={initialContent} 
        />
      </CollapsibleContent>
    </Collapsible>
  )
}
