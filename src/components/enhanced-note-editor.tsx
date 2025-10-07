"use client"

import { useState, useEffect } from "react"
import { upsertNote } from "@/app/actions/notes"
import { useDebounce } from "@/hooks/use-debounce"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Code, 
  Quote, 
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Edit,
  Save
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface EnhancedNoteEditorProps {
  videoId: string
  initialContent: string
}

export function EnhancedNoteEditor({ videoId, initialContent }: EnhancedNoteEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")
  const debouncedContent = useDebounce(content, 1000)

  useEffect(() => {
    const saveNote = async () => {
      if (debouncedContent !== initialContent) {
        setIsSaving(true)
        await upsertNote(videoId, debouncedContent)
        setIsSaving(false)
        setLastSaved(new Date())
      }
    }

    saveNote()
  }, [debouncedContent, videoId, initialContent])

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.querySelector("textarea")
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    
    setContent(newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const toolbarButtons = [
    { icon: Heading1, label: "Heading 1", action: () => insertMarkdown("# ", "\n") },
    { icon: Heading2, label: "Heading 2", action: () => insertMarkdown("## ", "\n") },
    { icon: Heading3, label: "Heading 3", action: () => insertMarkdown("### ", "\n") },
    { icon: Bold, label: "Bold", action: () => insertMarkdown("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertMarkdown("*", "*") },
    { icon: Code, label: "Code", action: () => insertMarkdown("`", "`") },
    { icon: Quote, label: "Quote", action: () => insertMarkdown("> ", "\n") },
    { icon: List, label: "Bullet List", action: () => insertMarkdown("- ", "\n") },
    { icon: ListOrdered, label: "Numbered List", action: () => insertMarkdown("1. ", "\n") },
    { icon: LinkIcon, label: "Link", action: () => insertMarkdown("[", "](url)") },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving ? (
            <>
              <Save className="h-3 w-3 animate-pulse" />
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <Save className="h-3 w-3" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </>
          ) : (
            <span>Auto-save enabled</span>
          )}
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "write" | "preview")}>
          <TabsList className="h-8">
            <TabsTrigger value="write" className="text-xs gap-1">
              <Edit className="h-3 w-3" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs gap-1">
              <Eye className="h-3 w-3" />
              Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "write" && (
        <>
          <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/50 p-1">
            {toolbarButtons.map((button, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={button.action}
                title={button.label}
              >
                <button.icon className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your notes in Markdown... 
            
# Headings
Use **bold**, *italic*, `code`
- Bullet points
1. Numbered lists
> Quotes
[Links](url)"
            className="min-h-[400px] font-mono text-sm"
          />
        </>
      )}

      {activeTab === "preview" && (
        <div className="min-h-[400px] rounded-lg border p-4">
          {content ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
              No content to preview
            </div>
          )}
        </div>
      )}
    </div>
  )
}
