"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { createLowlight } from "lowlight"
import js from "highlight.js/lib/languages/javascript"
import ts from "highlight.js/lib/languages/typescript"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Redo,
    Undo,
    Eye,
    EyeOff
} from "lucide-react"

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
    placeholder = "Start writing...",
    className = "",
    minHeight = "400px"
}: TiptapEditorProps) {
    const [showPreview, setShowPreview] = useState(false)
    const [showMarkdown, setShowMarkdown] = useState(false)

    // Create lowlight instance with language support
    const lowlight = createLowlight()
    lowlight.register('javascript', js)
    lowlight.register('typescript', ts)

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            CodeBlockLowlight.configure({
                lowlight
            })
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        }
    })

    useEffect(() => {
        if (editor && value && editor.getHTML() !== value) {
            editor.commands.setContent(value)
        }
    }, [])

    if (!editor) {
        return <div className="text-muted-foreground">Loading editor...</div>
    }

    return (
        <div className={`flex flex-col gap-3 rounded-lg border border-border bg-background ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-3">
                <ToolbarButton
                    icon={Bold}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    title="Bold (Ctrl+B)"
                />
                <ToolbarButton
                    icon={Italic}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    title="Italic (Ctrl+I)"
                />
                <ToolbarButton
                    icon={Strikethrough}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive("strike")}
                    title="Strikethrough"
                />
                <ToolbarButton
                    icon={Code}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive("code")}
                    title="Inline Code"
                />

                <div className="mx-1 h-6 w-px bg-border" />

                <ToolbarButton
                    icon={Heading1}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive("heading", { level: 1 })}
                    title="Heading 1"
                />
                <ToolbarButton
                    icon={Heading2}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive("heading", { level: 2 })}
                    title="Heading 2"
                />
                <ToolbarButton
                    icon={Heading3}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive("heading", { level: 3 })}
                    title="Heading 3"
                />

                <div className="mx-1 h-6 w-px bg-border" />

                <ToolbarButton
                    icon={List}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                    title="Bullet List"
                />
                <ToolbarButton
                    icon={ListOrdered}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                    title="Ordered List"
                />
                <ToolbarButton
                    icon={Quote}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive("blockquote")}
                    title="Blockquote"
                />

                <div className="mx-1 h-6 w-px bg-border" />

                <ToolbarButton
                    icon={Undo}
                    onClick={() => editor.chain().focus().undo().run()}
                    title="Undo (Ctrl+Z)"
                />
                <ToolbarButton
                    icon={Redo}
                    onClick={() => editor.chain().focus().redo().run()}
                    title="Redo (Ctrl+Y)"
                />

                <div className="ml-auto flex gap-1">
                    <ToolbarButton
                        icon={showMarkdown ? EyeOff : Eye}
                        onClick={() => setShowMarkdown(!showMarkdown)}
                        title={showMarkdown ? "Hide Markdown" : "Show Markdown"}
                    />
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex gap-3 p-3" style={{ minHeight }}>
                {/* Visual Editor */}
                <div className={`flex-1 overflow-hidden rounded border border-border bg-white dark:bg-slate-950 ${showMarkdown ? "md:w-1/2" : "w-full"}`}>
                    <EditorContent
                        editor={editor}
                        className="h-full overflow-y-auto p-4 prose prose-sm max-w-none dark:prose-invert"
                    />
                </div>

                {/* Markdown Preview */}
                {showMarkdown && (
                    <div className="w-1/2 overflow-hidden rounded border border-border bg-muted/30">
                        <textarea
                            value={editor.getHTML()}
                            readOnly
                            className="h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm dark:text-foreground"
                            placeholder="Markdown preview..."
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

interface ToolbarButtonProps {
    icon: React.ComponentType<{ size?: number; className?: string }>
    onClick: () => void
    isActive?: boolean
    title?: string
}

function ToolbarButton({ icon: Icon, onClick, isActive = false, title }: ToolbarButtonProps) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`inline-flex h-8 w-8 items-center justify-center rounded text-sm transition-colors ${isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted active:bg-muted"
                }`}
        >
            <Icon size={16} />
        </button>
    )
}
