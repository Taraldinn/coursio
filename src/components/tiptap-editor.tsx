"use client"

import { useEffect, useRef } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extension-placeholder"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Highlight } from "@tiptap/extension-highlight"
import { Link } from "@tiptap/extension-link"

interface TiptapEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    minHeight?: string
}

export function TiptapEditor({
    value,
    onChange,
    placeholder = "Start typing...",
    className = "",
    minHeight = "200px"
}: TiptapEditorProps) {
    const isFirstRender = useRef(true)

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] }
            }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Highlight.configure({ multicolor: true }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: "text-primary underline" }
            }),
            Placeholder.configure({ placeholder }),
        ],
        content: value || "",
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4",
            }
        },
        onUpdate: ({ editor }) => {
            if (!editor.isDestroyed) {
                onChange(editor.getHTML())
            }
        },
    })

    useEffect(() => {
        if (!editor) return
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        if (editor.isDestroyed) return
        const currentContent = editor.getHTML()
        if (currentContent !== value) {
            editor.commands.setContent(value || "")
        }
    }, [value, editor])

    if (!editor) return null

    return (
        <div className={`w-full ${className}`} style={{ minHeight }}>
            <EditorContent editor={editor} className="h-full" />
            <style jsx global>{`
                .ProseMirror {
                    min-height: inherit;
                    outline: none !important;
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: hsl(var(--muted-foreground) / 0.5);
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror ul[data-type="taskList"] {
                    list-style: none;
                    padding-left: 0;
                }
                .ProseMirror ul[data-type="taskList"] li {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                }
                .ProseMirror ul[data-type="taskList"] li > label {
                    flex-shrink: 0;
                    user-select: none;
                    margin-top: 0.125rem;
                }
                .ProseMirror ul[data-type="taskList"] li > div {
                    flex: 1;
                }
            `}</style>
        </div>
    )
}

// Export NotionEditor for backward compatibility
export { NotionEditor } from "./notion-editor"
