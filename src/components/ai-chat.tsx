"use client"

import { useState, useEffect, useRef, useCallback, FormEvent } from "react"
import { Bot, Send, Key, Loader2, Trash2, Settings, X, AlertCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

interface AIChatProps {
    context?: string // Current video context, notes, etc.
    className?: string
}

export function AIChat({ context, className }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [apiKey, setApiKey] = useState("")
    const [showApiKeyInput, setShowApiKeyInput] = useState(false)
    const [hasApiKey, setHasApiKey] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Load API key from localStorage on mount
    useEffect(() => {
        const savedKey = localStorage.getItem("coursio_openai_api_key")
        if (savedKey) {
            setApiKey(savedKey)
            setHasApiKey(true)
        }
    }, [])

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const saveApiKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem("coursio_openai_api_key", apiKey.trim())
            setHasApiKey(true)
            setShowApiKeyInput(false)
            setError(null)
        }
    }

    const removeApiKey = () => {
        localStorage.removeItem("coursio_openai_api_key")
        setApiKey("")
        setHasApiKey(false)
        setMessages([])
        setError(null)
    }

    const generateId = () => {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const sendMessage = useCallback(async (e?: FormEvent) => {
        e?.preventDefault()

        if (!inputValue.trim() || isLoading || !hasApiKey) return

        const userMessage: Message = {
            id: generateId(),
            role: "user",
            content: inputValue.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue("")
        setIsLoading(true)
        setError(null)

        try {
            const systemPrompt = context
                ? `You are a helpful AI learning assistant. You help users understand course content, take better notes, and answer questions about the material they're studying. 

Current context:
${context}

Be concise, helpful, and educational. If the user asks about something not related to learning or the current content, you can still help but gently remind them of your purpose.`
                : `You are a helpful AI learning assistant. You help users understand course content, take better notes, and answer questions about the material they're studying. Be concise, helpful, and educational.`

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: "user", content: userMessage.content }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                if (response.status === 401) {
                    throw new Error("Invalid API key. Please check your OpenAI API key.")
                } else if (response.status === 429) {
                    throw new Error("Rate limit exceeded. Please wait a moment and try again.")
                } else if (response.status === 402 || errorData?.error?.code === "insufficient_quota") {
                    throw new Error("Insufficient quota. Please check your OpenAI billing.")
                } else {
                    throw new Error(errorData?.error?.message || `API error: ${response.status}`)
                }
            }

            const data = await response.json()
            const assistantContent = data.choices?.[0]?.message?.content

            if (assistantContent) {
                const assistantMessage: Message = {
                    id: generateId(),
                    role: "assistant",
                    content: assistantContent,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, assistantMessage])
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to get response from AI"
            setError(errorMessage)
            console.error("AI Chat error:", err)
        } finally {
            setIsLoading(false)
            inputRef.current?.focus()
        }
    }, [inputValue, isLoading, hasApiKey, apiKey, messages, context])

    const clearChat = () => {
        setMessages([])
        setError(null)
    }

    return (
        <div className={cn("flex h-full flex-col", className)}>
            {/* Settings Row */}
            <div className="flex-shrink-0 border-b border-border px-4 py-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {hasApiKey ? (
                            <>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    API Key Connected
                                </span>
                            </>
                        ) : (
                            <span className="flex items-center gap-1 text-amber-500">
                                <AlertCircle className="h-3 w-3" />
                                No API Key
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {messages.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={clearChat}
                                title="Clear chat"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                            title="API Settings"
                        >
                            <Settings className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {/* API Key Input */}
                {showApiKeyInput && (
                    <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                            <Input
                                type="password"
                                placeholder="Enter your OpenAI API key..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="h-8 text-xs"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        saveApiKey()
                                    }
                                }}
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 px-3"
                                onClick={saveApiKey}
                                disabled={!apiKey.trim()}
                            >
                                <Key className="h-3 w-3 mr-1" />
                                Save
                            </Button>
                        </div>
                        {hasApiKey && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive"
                                onClick={removeApiKey}
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove API Key
                            </Button>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Your API key is stored locally and never sent to our servers.
                            Get your key from{" "}
                            <a
                                href="https://platform.openai.com/api-keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                OpenAI Dashboard
                            </a>
                        </p>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <div className="rounded-full bg-primary/10 p-4 mb-4">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold mb-1">AI Learning Assistant</h3>
                        <p className="text-xs text-muted-foreground max-w-[200px]">
                            {hasApiKey
                                ? "Ask questions about the video, get help with your notes, or explore concepts further."
                                : "Add your OpenAI API key above to start chatting with the AI assistant."
                            }
                        </p>
                        {hasApiKey && (
                            <div className="mt-4 space-y-2">
                                <p className="text-xs text-muted-foreground">Try asking:</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {[
                                        "Summarize this video",
                                        "Explain this concept",
                                        "Create a quiz"
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => {
                                                setInputValue(suggestion)
                                                inputRef.current?.focus()
                                            }}
                                            className="text-xs px-2 py-1 rounded-full border border-border hover:bg-muted transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex gap-3",
                                    message.role === "user" && "flex-row-reverse"
                                )}
                            >
                                <div className={cn(
                                    "flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center",
                                    message.role === "assistant"
                                        ? "bg-primary/10"
                                        : "bg-muted"
                                )}>
                                    {message.role === "assistant" ? (
                                        <Bot className="h-4 w-4 text-primary" />
                                    ) : (
                                        <span className="text-xs font-medium">You</span>
                                    )}
                                </div>
                                <div className={cn(
                                    "flex-1 rounded-lg px-3 py-2 text-sm",
                                    message.role === "assistant"
                                        ? "bg-muted"
                                        : "bg-primary text-primary-foreground"
                                )}>
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center bg-primary/10">
                                    <Bot className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 rounded-lg px-3 py-2 bg-muted">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Thinking...
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-destructive">{error}</p>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 border-t border-border p-4">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder={hasApiKey ? "Ask a question..." : "Add API key to chat..."}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={!hasApiKey || isLoading}
                        className="flex-1 h-9"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="h-9 w-9"
                        disabled={!hasApiKey || !inputValue.trim() || isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
