"use client"

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { TaskList } from "@tiptap/extension-task-list"
import { TaskItem } from "@tiptap/extension-task-item"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { Link } from "@tiptap/extension-link"
import { Image } from "@tiptap/extension-image"
import { Placeholder } from "@tiptap/extension-placeholder"
import Typography from "@tiptap/extension-typography"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import { createLowlight } from "lowlight"
import js from "highlight.js/lib/languages/javascript"
import ts from "highlight.js/lib/languages/typescript"
import python from "highlight.js/lib/languages/python"
import css from "highlight.js/lib/languages/css"
import html from "highlight.js/lib/languages/xml"
import { useEffect, useRef, useState } from "react"
import {
    Type,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    Quote,
    Code,
    Minus,
    Table2,
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Link2,
    Highlighter,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Palette,
    GripVertical
} from "lucide-react"

interface NotionEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    minHeight?: string
}

// Create lowlight instance once outside component
const lowlight = createLowlight()
lowlight.register("javascript", js)
lowlight.register("typescript", ts)
lowlight.register("python", python)
lowlight.register("css", css)
lowlight.register("html", html)

// Slash command items
const slashCommands = [
    {
        title: "Text",
        description: "Just start typing with plain text",
        icon: Type,
        command: (editor: any) => {
            editor.chain().focus().setParagraph().run()
        }
    },
    {
        title: "Heading 1",
        description: "Big section heading",
        icon: Heading1,
        command: (editor: any) => {
            editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
    },
    {
        title: "Heading 2",
        description: "Medium section heading",
        icon: Heading2,
        command: (editor: any) => {
            editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
    },
    {
        title: "Heading 3",
        description: "Small section heading",
        icon: Heading3,
        command: (editor: any) => {
            editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
    },
    {
        title: "Bullet List",
        description: "Create a simple bullet list",
        icon: List,
        command: (editor: any) => {
            editor.chain().focus().toggleBulletList().run()
        }
    },
    {
        title: "Numbered List",
        description: "Create a list with numbering",
        icon: ListOrdered,
        command: (editor: any) => {
            editor.chain().focus().toggleOrderedList().run()
        }
    },
    {
        title: "Todo List",
        description: "Track tasks with a to-do list",
        icon: CheckSquare,
        command: (editor: any) => {
            editor.chain().focus().toggleTaskList().run()
        }
    },
    {
        title: "Quote",
        description: "Capture a quote",
        icon: Quote,
        command: (editor: any) => {
            editor.chain().focus().toggleBlockquote().run()
        }
    },
    {
        title: "Code Block",
        description: "Display code with syntax highlighting",
        icon: Code,
        command: (editor: any) => {
            editor.chain().focus().toggleCodeBlock().run()
        }
    },
    {
        title: "Divider",
        description: "Visually divide blocks",
        icon: Minus,
        command: (editor: any) => {
            editor.chain().focus().setHorizontalRule().run()
        }
    },
    {
        title: "Table",
        description: "Add a table",
        icon: Table2,
        command: (editor: any) => {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
    }
]

// Text colors for the color picker
const textColors = [
    { name: "Default", value: "" },
    { name: "Gray", value: "#9CA3AF" },
    { name: "Red", value: "#EF4444" },
    { name: "Orange", value: "#F97316" },
    { name: "Yellow", value: "#EAB308" },
    { name: "Green", value: "#22C55E" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Purple", value: "#A855F7" },
    { name: "Pink", value: "#EC4899" }
]

// Highlight colors
const highlightColors = [
    { name: "None", value: "" },
    { name: "Gray", value: "#F3F4F6" },
    { name: "Red", value: "#FEE2E2" },
    { name: "Orange", value: "#FFEDD5" },
    { name: "Yellow", value: "#FEF9C3" },
    { name: "Green", value: "#D1FAE5" },
    { name: "Blue", value: "#DBEAFE" },
    { name: "Purple", value: "#F3E8FF" },
    { name: "Pink", value: "#FCE7F3" }
]

export function NotionEditor({
    value,
    onChange,
    placeholder = "Type '/' for commands...",
    className = "",
    minHeight = "400px"
}: NotionEditorProps) {
    const isFirstRender = useRef(true)
    const [showSlashMenu, setShowSlashMenu] = useState(false)
    const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showHighlightPicker, setShowHighlightPicker] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const editor = useEditor({
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            CodeBlockLowlight.configure({
                lowlight
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
                HTMLAttributes: {
                    class: "flex items-start gap-2"
                }
            }),
            Table.configure({
                resizable: true
            }),
            TableRow,
            TableCell,
            TableHeader,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline cursor-pointer hover:text-primary/80"
                }
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-lg my-4 max-w-full"
                }
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === "heading") {
                        return "Heading"
                    }

                    return placeholder
                }
            }),
            Typography,
            Highlight.configure({
                multicolor: true
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph']
            }),
            Underline,
            TextStyle,
            Color
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const text = editor.getText()
            const { from } = editor.state.selection

            // Check for slash command
            const textBeforeCursor = text.slice(Math.max(0, from - 20), from)
            const slashMatch = textBeforeCursor.match(/\/(\w*)$/)

            if (slashMatch) {
                const query = slashMatch[1]
                setSearchQuery(query)
                setShowSlashMenu(true)
                setSelectedIndex(0)

                // Get cursor position for menu placement
                const coords = editor.view.coordsAtPos(from)
                setSlashMenuPosition({
                    top: coords.bottom,
                    left: coords.left
                })
            } else {
                setShowSlashMenu(false)
                setSearchQuery("")
            }

            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: "notion-editor-content"
            },
            handleKeyDown: (view, event) => {
                if (!showSlashMenu) return false

                if (event.key === "ArrowDown") {
                    event.preventDefault()
                    setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
                    return true
                }

                if (event.key === "ArrowUp") {
                    event.preventDefault()
                    setSelectedIndex((prev) => Math.max(prev - 1, 0))
                    return true
                }

                if (event.key === "Enter" || event.key === "Tab") {
                    event.preventDefault()
                    executeCommand(selectedIndex)
                    return true
                }

                if (event.key === "Escape") {
                    setShowSlashMenu(false)
                    return true
                }

                return false
            }
        }
    })

    // Filter commands based on search query
    const filteredCommands = slashCommands.filter((cmd) =>
        cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const executeCommand = (index: number) => {
        if (!editor) return

        const command = filteredCommands[index]
        if (!command) return

        // Remove the slash and query text
        const { from } = editor.state.selection
        const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from)
        const slashMatch = textBefore.match(/\/(\w*)$/)

        if (slashMatch) {
            const matchLength = slashMatch[0].length
            editor.chain()
                .focus()
                .deleteRange({ from: from - matchLength, to: from })
                .run()
        }

        // Execute the command
        command.command(editor)
        setShowSlashMenu(false)
        setSearchQuery("")
    }

    const setLink = () => {
        if (!editor) return
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        if (url === null) return

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    const setColor = (color: string) => {
        if (!editor) return
        if (color) {
            editor.chain().focus().setColor(color).run()
        } else {
            editor.chain().focus().unsetColor().run()
        }
        setShowColorPicker(false)
    }

    const setHighlight = (color: string) => {
        if (!editor) return
        if (color) {
            editor.chain().focus().setHighlight({ color }).run()
        } else {
            editor.chain().focus().unsetHighlight().run()
        }
        setShowHighlightPicker(false)
    }

    // Update content when value changes from outside
    useEffect(() => {
        if (!editor || !value) return

        // Skip first render
        if (isFirstRender.current) {
            isFirstRender.current = false

            return
        }

        const currentContent = editor.getHTML()

        // Only update if content is different
        if (currentContent !== value) {
            editor.commands.setContent(value)
        }
    }, [value, editor])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            editor?.destroy()
        }
    }, [editor])

    if (!editor) {
        return null
    }

    return (
        <div className={`notion-editor-wrapper ${className}`} style={{ minHeight }}>
            <style jsx global>{`
                .notion-editor-wrapper {
                    width: 100%;
                    height: 100%;
                    min-height: inherit;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif;
                    position: relative;
                }

                .notion-editor-content {
                    width: 100%;
                    min-height: inherit;
                    outline: none !important;
                    padding: 2rem 3rem;
                    font-size: 16px;
                    line-height: 1.5;
                    color: hsl(var(--foreground));
                    background: transparent;
                }

                .notion-editor-content:focus {
                    outline: none !important;
                }

                .notion-editor-content .is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: hsl(var(--muted-foreground) / 0.4);
                    pointer-events: none;
                    height: 0;
                }

                .notion-editor-content h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-top: 2rem;
                    margin-bottom: 0.25rem;
                    line-height: 1.2;
                    color: hsl(var(--foreground));
                }

                .notion-editor-content h2 {
                    font-size: 1.875rem;
                    font-weight: 600;
                    margin-top: 1.5rem;
                    margin-bottom: 0.25rem;
                    line-height: 1.3;
                    color: hsl(var(--foreground));
                }

                .notion-editor-content h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 1rem;
                    margin-bottom: 0.25rem;
                    line-height: 1.4;
                    color: hsl(var(--foreground));
                }

                .notion-editor-content p {
                    margin-top: 0;
                    margin-bottom: 0.25rem;
                    line-height: 1.5;
                }

                .notion-editor-content p:empty::before {
                    content: "";
                    display: inline-block;
                }

                .notion-editor-content ul,
                .notion-editor-content ol {
                    margin-top: 0.25rem;
                    margin-bottom: 0.25rem;
                    padding-left: 1.75rem;
                }

                .notion-editor-content li {
                    margin-bottom: 0.125rem;
                    line-height: 1.5;
                }

                .notion-editor-content ul > li {
                    list-style-type: disc;
                }

                .notion-editor-content ol > li {
                    list-style-type: decimal;
                }

                .notion-editor-content ul[data-type="taskList"] {
                    list-style-type: none;
                    padding-left: 0;
                }

                .notion-editor-content ul[data-type="taskList"] li {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }

                .notion-editor-content ul[data-type="taskList"] li > label {
                    flex: 0 0 auto;
                    margin-top: 0.125rem;
                    user-select: none;
                }

                .notion-editor-content ul[data-type="taskList"] li > div {
                    flex: 1;
                }

                .notion-editor-content ul[data-type="taskList"] li input[type="checkbox"] {
                    width: 1.125rem;
                    height: 1.125rem;
                    accent-color: hsl(var(--primary));
                    cursor: pointer;
                }

                .notion-editor-content blockquote {
                    border-left: 3px solid hsl(var(--foreground) / 0.15);
                    margin: 0.25rem 0;
                    padding-left: 1rem;
                    color: hsl(var(--foreground));
                    font-size: 1rem;
                }

                .notion-editor-content pre {
                    background: hsl(var(--muted));
                    border: 1px solid hsl(var(--border));
                    border-radius: 0.375rem;
                    padding: 1rem;
                    margin: 0.5rem 0;
                    overflow-x: auto;
                    font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
                    font-size: 0.875rem;
                    line-height: 1.6;
                }

                .notion-editor-content pre code {
                    background: none;
                    padding: 0;
                    border-radius: 0;
                    color: hsl(var(--foreground));
                    font-size: inherit;
                }

                .notion-editor-content :not(pre) > code {
                    background: hsl(var(--muted));
                    border-radius: 0.25rem;
                    padding: 0.125rem 0.375rem;
                    font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
                    font-size: 0.875em;
                    color: hsl(var(--foreground) / 0.9);
                }

                .notion-editor-content a {
                    color: hsl(var(--primary));
                    text-decoration: underline;
                    text-underline-offset: 2px;
                    cursor: pointer;
                    transition: all 0.1s ease;
                }

                .notion-editor-content a:hover {
                    opacity: 0.8;
                }

                .notion-editor-content strong {
                    font-weight: 600;
                }

                .notion-editor-content em {
                    font-style: italic;
                }

                .notion-editor-content s {
                    text-decoration: line-through;
                }

                .notion-editor-content u {
                    text-decoration: underline;
                }

                .notion-editor-content hr {
                    border: none;
                    border-top: 1px solid hsl(var(--border));
                    margin: 1.5rem 0;
                }

                .notion-editor-content table {
                    border-collapse: collapse;
                    margin: 1rem 0;
                    width: 100%;
                    overflow: hidden;
                }

                .notion-editor-content th,
                .notion-editor-content td {
                    border: 1px solid hsl(var(--border));
                    padding: 0.5rem 0.75rem;
                    text-align: left;
                    min-width: 100px;
                }

                .notion-editor-content th {
                    background: hsl(var(--muted) / 0.5);
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .notion-editor-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.375rem;
                }

                .notion-editor-content ::selection {
                    background: hsl(var(--primary) / 0.15);
                }

                .notion-editor-content mark {
                    border-radius: 0.25rem;
                    padding: 0.125rem 0;
                }

                /* Bubble Menu Styles */
                .bubble-menu-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.5rem;
                    background: hsl(var(--popover));
                    border: 1px solid hsl(var(--border));
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .bubble-menu-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 2rem;
                    height: 2rem;
                    border-radius: 0.375rem;
                    background: transparent;
                    border: none;
                    color: hsl(var(--foreground));
                    cursor: pointer;
                    transition: all 0.1s ease;
                    position: relative;
                }

                .bubble-menu-button:hover {
                    background: hsl(var(--muted));
                }

                .bubble-menu-button.is-active {
                    background: hsl(var(--primary));
                    color: hsl(var(--primary-foreground));
                }

                .bubble-menu-divider {
                    width: 1px;
                    height: 1.5rem;
                    background: hsl(var(--border));
                    margin: 0 0.25rem;
                }

                .color-picker-dropdown {
                    position: absolute;
                    top: calc(100% + 0.5rem);
                    left: 0;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: hsl(var(--popover));
                    border: 1px solid hsl(var(--border));
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    min-width: 180px;
                }

                .color-swatch {
                    width: 2rem;
                    height: 2rem;
                    border-radius: 0.375rem;
                    border: 2px solid hsl(var(--border));
                    cursor: pointer;
                    transition: all 0.1s ease;
                }

                .color-swatch:hover {
                    transform: scale(1.1);
                    border-color: hsl(var(--primary));
                }

                .slash-menu {
                    position: fixed;
                    background: hsl(var(--popover));
                    border: 1px solid hsl(var(--border));
                    border-radius: 0.5rem;
                    padding: 0.5rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    max-height: 400px;
                    overflow-y: auto;
                    min-width: 300px;
                }

                .slash-menu-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    transition: all 0.1s ease;
                }

                .slash-menu-item:hover,
                .slash-menu-item.selected {
                    background: hsl(var(--muted));
                }

                .slash-menu-item-icon {
                    flex-shrink: 0;
                    margin-top: 0.125rem;
                    color: hsl(var(--muted-foreground));
                }

                .slash-menu-item-content {
                    flex: 1;
                }

                .slash-menu-item-title {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: hsl(var(--foreground));
                }

                .slash-menu-item-description {
                    font-size: 0.75rem;
                    color: hsl(var(--muted-foreground));
                    margin-top: 0.125rem;
                }

                /* Block handles */
                .notion-editor-content > *:hover .block-handle {
                    opacity: 1;
                }

                .block-handle {
                    opacity: 0;
                    position: absolute;
                    left: -2rem;
                    top: 0.25rem;
                    cursor: grab;
                    color: hsl(var(--muted-foreground));
                    transition: opacity 0.2s ease;
                }

                .block-handle:hover {
                    color: hsl(var(--foreground));
                }
            `}</style>

            <EditorContent editor={editor} />

            {/* Bubble Menu - appears on text selection */}
            {editor && (
                <BubbleMenu
                    editor={editor}
                    tippyOptions={{ duration: 100, placement: "top" }}
                    className="bubble-menu-wrapper"
                >
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`bubble-menu-button ${editor.isActive("bold") ? "is-active" : ""}`}
                        title="Bold (Cmd+B)"
                    >
                        <Bold size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`bubble-menu-button ${editor.isActive("italic") ? "is-active" : ""}`}
                        title="Italic (Cmd+I)"
                    >
                        <Italic size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={`bubble-menu-button ${editor.isActive("underline") ? "is-active" : ""}`}
                        title="Underline (Cmd+U)"
                    >
                        <UnderlineIcon size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`bubble-menu-button ${editor.isActive("strike") ? "is-active" : ""}`}
                        title="Strikethrough"
                    >
                        <Strikethrough size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={`bubble-menu-button ${editor.isActive("code") ? "is-active" : ""}`}
                        title="Code"
                    >
                        <Code size={16} />
                    </button>

                    <div className="bubble-menu-divider" />

                    <button
                        onClick={setLink}
                        className={`bubble-menu-button ${editor.isActive("link") ? "is-active" : ""}`}
                        title="Add Link"
                    >
                        <Link2 size={16} />
                    </button>

                    <div className="bubble-menu-divider" />

                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => {
                                setShowColorPicker(!showColorPicker)
                                setShowHighlightPicker(false)
                            }}
                            className="bubble-menu-button"
                            title="Text Color"
                        >
                            <Palette size={16} />
                        </button>
                        {showColorPicker && (
                            <div className="color-picker-dropdown">
                                {textColors.map((color) => (
                                    <button
                                        key={color.name}
                                        className="color-swatch"
                                        style={{
                                            backgroundColor: color.value || "transparent",
                                            border: !color.value ? "2px dashed hsl(var(--border))" : undefined
                                        }}
                                        onClick={() => setColor(color.value)}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => {
                                setShowHighlightPicker(!showHighlightPicker)
                                setShowColorPicker(false)
                            }}
                            className={`bubble-menu-button ${editor.isActive("highlight") ? "is-active" : ""}`}
                            title="Highlight"
                        >
                            <Highlighter size={16} />
                        </button>
                        {showHighlightPicker && (
                            <div className="color-picker-dropdown">
                                {highlightColors.map((color) => (
                                    <button
                                        key={color.name}
                                        className="color-swatch"
                                        style={{
                                            backgroundColor: color.value || "transparent",
                                            border: !color.value ? "2px dashed hsl(var(--border))" : undefined
                                        }}
                                        onClick={() => setHighlight(color.value)}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bubble-menu-divider" />

                    <button
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={`bubble-menu-button ${editor.isActive({ textAlign: 'left' }) ? "is-active" : ""}`}
                        title="Align Left"
                    >
                        <AlignLeft size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={`bubble-menu-button ${editor.isActive({ textAlign: 'center' }) ? "is-active" : ""}`}
                        title="Align Center"
                    >
                        <AlignCenter size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={`bubble-menu-button ${editor.isActive({ textAlign: 'right' }) ? "is-active" : ""}`}
                        title="Align Right"
                    >
                        <AlignRight size={16} />
                    </button>
                </BubbleMenu>
            )}

            {/* Slash Command Menu */}
            {showSlashMenu && filteredCommands.length > 0 && (
                <div
                    ref={menuRef}
                    className="slash-menu"
                    style={{
                        top: slashMenuPosition.top,
                        left: slashMenuPosition.left
                    }}
                >
                    {filteredCommands.map((command, index) => (
                        <div
                            key={command.title}
                            className={`slash-menu-item ${index === selectedIndex ? 'selected' : ''}`}
                            onClick={() => executeCommand(index)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div className="slash-menu-item-icon">
                                <command.icon size={18} />
                            </div>
                            <div className="slash-menu-item-content">
                                <div className="slash-menu-item-title">{command.title}</div>
                                <div className="slash-menu-item-description">{command.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
