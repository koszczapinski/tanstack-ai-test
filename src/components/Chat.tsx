import React, { useState, useEffect, useRef } from 'react'
import { useChat, fetchHttpStream } from '@tanstack/ai-react'
import { Send, User, Bot, Loader2, Plus, MessageSquare, Trash2, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ChatSession {
  id: string
  title: string
  messages: any[]
  createdAt: number
}

const STORAGE_KEY = 'tanstack-ai-chat-history'

export function Chat() {
  const [model, setModel] = useState('gpt-4o')
  // Initialize sessions from localStorage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('Failed to load chat history', e)
      return []
    }
  })
  
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { messages, sendMessage, isLoading, setMessages } = useChat({
    connection: fetchHttpStream(`/api/chat?model=${model}`),
  })

  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }, [sessions])

  // Sync current messages to the active session
  useEffect(() => {
    if (messages.length === 0 && !currentId) return

    // If we have messages but no currentId, start a new session
    if (messages.length > 0 && !currentId) {
      const newId = Date.now().toString()
      const title = messages[0].parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.content)
        .join('')
        .slice(0, 30) + '...' || 'New Chat'
      
      const newSession: ChatSession = {
        id: newId,
        title,
        messages,
        createdAt: Date.now()
      }
      
      setSessions(prev => [newSession, ...prev])
      setCurrentId(newId)
    } 
    // If we have a currentId, update the existing session
    else if (currentId) {
      setSessions(prev => prev.map(session => {
        if (session.id === currentId) {
          // Update title if it's the generic "New Chat" and we have content now
          let title = session.title
          if (title === 'New Chat' && messages.length > 0) {
             title = messages[0].parts
              .filter((p: any) => p.type === 'text')
              .map((p: any) => p.content)
              .join('')
              .slice(0, 30) + '...' || 'New Chat'
          }

          return { ...session, messages, title }
        }
        return session
      }))
    }
  }, [messages, currentId]) // Intentionally not including sessions to avoid loop, we use functional update

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const currentInput = input
    setInput('')
    await sendMessage(currentInput)
  }

  const startNewChat = () => {
    setCurrentId(null)
    setMessages([])
    setIsMobileMenuOpen(false)
    if (window.innerWidth < 768) {
      // Small delay to allow UI to update before closing if needed
    }
  }

  const loadSession = (session: ChatSession) => {
    if (isLoading) return // Prevent switching while generating
    setCurrentId(session.id)
    setMessages(session.messages)
    setIsMobileMenuOpen(false)
  }

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSessions(prev => prev.filter(s => s.id !== id))
    if (currentId === id) {
      setCurrentId(null)
      setMessages([])
    }
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="p-4 border-b flex items-center justify-between gap-2">
            <Button 
              onClick={startNewChat} 
              className="flex-1 justify-start gap-2" 
              variant="default"
            >
              <Plus size={16} />
              New Chat
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                onClick={() => setIsMobileMenuOpen(false)}
            >
                <X size={20} />
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {sessions.length === 0 && (
                <div className="p-4 text-center text-sm text-slate-500">
                  No chat history
                </div>
              )}
              {sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => loadSession(session)}
                  className={cn(
                    "group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors cursor-pointer hover:bg-slate-100",
                    currentId === session.id ? "bg-slate-100 font-medium text-primary" : "text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MessageSquare size={14} className="shrink-0" />
                    <span className="truncate">{session.title}</span>
                  </div>
                  <button
                    onClick={(e) => deleteSession(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                    title="Delete chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm shrink-0 h-16">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Bot className="h-6 w-6 text-primary" />
              <span className="hidden sm:inline">TanStack AI Chat</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-slate-500">Model:</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden relative">
           <ScrollArea ref={scrollRef} className="h-full px-4 py-6 md:px-8">
            <div className="mx-auto max-w-3xl space-y-6 pb-4">
              {messages.length === 0 && (
                <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-slate-400">
                  <div className="p-6 bg-slate-50 rounded-full">
                    <Bot className="h-12 w-12 opacity-50" />
                  </div>
                  <p className="text-lg font-medium">How can I help you today?</p>
                </div>
              )}

              {messages.map((m: any) => (
                <div
                  key={m.id}
                  className={cn(
                    'flex w-full gap-4',
                    m.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'flex max-w-[85%] md:max-w-[75%] gap-3',
                      m.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-1',
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-white border border-slate-200 text-primary',
                      )}
                    >
                      {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div
                      className={cn(
                        'overflow-hidden rounded-2xl px-5 py-3 text-sm shadow-sm',
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none',
                      )}
                    >
                      {m.parts.map(
                        (part: any, i: number) =>
                          part.type === 'text' && (
                            <div
                              key={i}
                              className={cn(
                                'prose prose-sm max-w-none break-words leading-relaxed',
                                m.role === 'user' ? 'prose-invert' : 'prose-slate',
                              )}
                            >
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code({
                                    inline,
                                    className,
                                    children,
                                    ...props
                                  }: React.ComponentPropsWithoutRef<'code'> & {
                                    inline?: boolean
                                  }) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return !inline && match ? (
                                      <SyntaxHighlighter
                                        {...props}
                                        style={oneDark}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{
                                          margin: '0.5rem 0',
                                          borderRadius: '0.375rem',
                                          fontSize: '0.8rem',
                                        }}
                                      >
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <code
                                        className={cn(
                                          'rounded px-1.5 py-0.5 font-mono text-xs font-medium',
                                          m.role === 'user'
                                            ? 'bg-primary-foreground/20 text-primary-foreground'
                                            : 'bg-slate-100 text-slate-800',
                                          className,
                                        )}
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    )
                                  },
                                }}
                              >
                                {part.content}
                              </ReactMarkdown>
                            </div>
                          ),
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start gap-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 mt-1">
                    <Bot size={16} className="text-primary" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none border border-slate-100 bg-white px-5 py-3 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  </div>
                </div>
              )}
            </div>
           </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <div className="mx-auto max-w-3xl">
             <form onSubmit={handleSend} className="flex w-full gap-3">
              <Input
                placeholder="Message TanStack AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="h-12 flex-1 bg-slate-50 focus-visible:ring-1 focus-visible:ring-primary"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="h-12 w-12 shrink-0 rounded-lg shadow-sm"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <div className="mt-2 text-center text-xs text-slate-400">
               AI responses can be inaccurate. Check important info.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
