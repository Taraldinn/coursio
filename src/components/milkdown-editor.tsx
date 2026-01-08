"use client"

import { useEffect, useRef } from "react"
import { Editor, rootCtx, defaultValueCtx } from "@milkdown/core"
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react"
import { commonmark } from "@milkdown/preset-commonmark"
import { gfm } from "@milkdown/preset-gfm"
import { nord } from "@milkdown/theme-nord"
import { listener, listenerCtx } from "@milkdown/plugin-listener"
import "@milkdown/theme-nord/style.css"

interface MilkdownEditorContentProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

function MilkdownEditorContent({ value, onChange, placeholder }: MilkdownEditorContentProps) {
    const valueRef = useRef(value)
    const initializedRef = useRef(false)

    useEffect(() => {
        valueRef.current = value
    }, [value])

    const { get } = useEditor((root) => {
        return Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root)
                ctx.set(defaultValueCtx, value || "")
                ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
                    if (initializedRef.current && markdown !== valueRef.current) {
                        onChange(markdown)
                    }
                })
            })
            .config(nord)
            .use(commonmark)
            .use(gfm)
            .use(listener)
    }, [])

    useEffect(() => {
        // Mark as initialized after first render
        const timer = setTimeout(() => {
            initializedRef.current = true
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    return <Milkdown />
}

interface MilkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    minHeight?: string
}

export function MilkdownEditor({
    value,
    onChange,
    placeholder = "Start writing...",
    className = "",
    minHeight = "400px"
}: MilkdownEditorProps) {
    // Ensure placeholder text is safe for CSS content usage
    const safePlaceholder = placeholder.replace(/"/g, '\\"')

    return (
        <MilkdownProvider>
            <div
                className={`milkdown-editor-wrapper ${className}`}
                style={{ minHeight }}
            >
                <style jsx global>{`
                .milkdown-editor-wrapper {
                    width: 100%;
                    height: 100%;
                }
                
                .milkdown-editor-wrapper .milkdown {
                    width: 100%;
                    height: 100%;
                    min-height: inherit;
                }
                
                .milkdown-editor-wrapper .editor {
                    width: 100%;
                    height: 100%;
                    min-height: inherit;
                    outline: none;
                    padding: 0;
                }
                
                .milkdown-editor-wrapper .ProseMirror {
                    width: 100%;
                    min-height: inherit;
                    outline: none !important;
                    padding: 0.5rem;
                    font-size: 0.875rem;
                    line-height: 1.625;
                    color: hsl(var(--foreground));
                    background: transparent;
                }
                
                .milkdown-editor-wrapper .ProseMirror:focus {
                    outline: none !important;
                    box-shadow: none !important;
                }
                
                /* Empty placeholder */
                .milkdown-editor-wrapper .ProseMirror p.is-editor-empty:first-child::before {
                    content: "${safePlaceholder}";
                    float: left;
                    color: hsl(var(--muted-foreground) / 0.5);
                    pointer-events: none;
                    height: 0;
                }
                
                /* Override nord theme for dark mode compatibility */
                .milkdown-editor-wrapper .milkdown-theme-nord {
                    --nord-font-family: inherit;
                    --nord-shadow: none;
                    --nord-border: hsl(var(--border));
                }
                
                /* Headings */
                .milkdown-editor-wrapper .ProseMirror h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    line-height: 1.2;
                    color: hsl(var(--foreground));
                }
                
                .milkdown-editor-wrapper .ProseMirror h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                    line-height: 1.3;
                    color: hsl(var(--foreground));
                }
                
                .milkdown-editor-wrapper .ProseMirror h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                    line-height: 1.4;
                    color: hsl(var(--foreground));
                }
                
                /* Paragraphs */
                .milkdown-editor-wrapper .ProseMirror p {
                    margin-top: 0;
                    margin-bottom: 0.75rem;
                }
                
                /* Lists */
                .milkdown-editor-wrapper .ProseMirror ul,
                .milkdown-editor-wrapper .ProseMirror ol {
                    margin-top: 0.5rem;
                    margin-bottom: 0.75rem;
                    padding-left: 1.5rem;
                }
                
                .milkdown-editor-wrapper .ProseMirror li {
                    margin-bottom: 0.25rem;
                }
                
                .milkdown-editor-wrapper .ProseMirror ul li {
                    list-style-type: disc;
                }
                
                .milkdown-editor-wrapper .ProseMirror ol li {
                    list-style-type: decimal;
                }
                
                /* Task lists (GFM) */
                .milkdown-editor-wrapper .ProseMirror ul.task-list {
                    list-style-type: none;
                    padding-left: 0;
                }
                
                .milkdown-editor-wrapper .ProseMirror ul.task-list li {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                }
                
                .milkdown-editor-wrapper .ProseMirror ul.task-list li input[type="checkbox"] {
                    margin-top: 0.25rem;
                    width: 1rem;
                    height: 1rem;
                    accent-color: hsl(var(--primary));
                }
                
                /* Blockquotes */
                .milkdown-editor-wrapper .ProseMirror blockquote {
                    border-left: 3px solid hsl(var(--primary));
                    margin: 0.75rem 0;
                    padding-left: 1rem;
                    color: hsl(var(--muted-foreground));
                    font-style: italic;
                }
                
                /* Code blocks */
                .milkdown-editor-wrapper .ProseMirror pre {
                    background: hsl(var(--muted));
                    border-radius: 0.375rem;
                    padding: 0.75rem 1rem;
                    margin: 0.75rem 0;
                    overflow-x: auto;
                    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
                    font-size: 0.8125rem;
                }
                
                .milkdown-editor-wrapper .ProseMirror pre code {
                    background: none;
                    padding: 0;
                    border-radius: 0;
                    color: hsl(var(--foreground));
                }
                
                /* Inline code */
                .milkdown-editor-wrapper .ProseMirror code {
                    background: hsl(var(--muted));
                    border-radius: 0.25rem;
                    padding: 0.125rem 0.375rem;
                    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
                    font-size: 0.8125rem;
                    color: hsl(var(--primary));
                }
                
                /* Links */
                .milkdown-editor-wrapper .ProseMirror a {
                    color: hsl(var(--primary));
                    text-decoration: underline;
                    text-underline-offset: 2px;
                }
                
                .milkdown-editor-wrapper .ProseMirror a:hover {
                    text-decoration-thickness: 2px;
                }
                
                /* Bold and italic */
                .milkdown-editor-wrapper .ProseMirror strong {
                    font-weight: 600;
                }
                
                .milkdown-editor-wrapper .ProseMirror em {
                    font-style: italic;
                }
                
                /* Strikethrough (GFM) */
                .milkdown-editor-wrapper .ProseMirror s {
                    text-decoration: line-through;
                    color: hsl(var(--muted-foreground));
                }
                
                /* Horizontal rule */
                .milkdown-editor-wrapper .ProseMirror hr {
                    border: none;
                    border-top: 1px solid hsl(var(--border));
                    margin: 1.5rem 0;
                }
                
                /* Tables (GFM) */
                .milkdown-editor-wrapper .ProseMirror table {
                    border-collapse: collapse;
                    margin: 0.75rem 0;
                    width: 100%;
                }
                
                .milkdown-editor-wrapper .ProseMirror th,
                .milkdown-editor-wrapper .ProseMirror td {
                    border: 1px solid hsl(var(--border));
                    padding: 0.5rem 0.75rem;
                    text-align: left;
                }
                
                .milkdown-editor-wrapper .ProseMirror th {
                    background: hsl(var(--muted));
                    font-weight: 600;
                }
                
                /* Images */
                .milkdown-editor-wrapper .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.375rem;
                    margin: 0.75rem 0;
                }
                
                /* Selection */
                .milkdown-editor-wrapper .ProseMirror ::selection {
                    background: hsl(var(--primary) / 0.2);
                }
            `}</style>
                <MilkdownEditorContent
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                />
            </div>
        </MilkdownProvider>
    )
}
