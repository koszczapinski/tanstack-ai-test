import React, { useState, useEffect, useRef } from 'react'
import { useChat, fetchHttpStream } from '@tanstack/ai-react'
import { Send, User, Bot, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function Chat() {
  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchHttpStream('/api/chat'),
  })

  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const currentInput = input
    setInput('')
    await sendMessage(currentInput)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="flex h-[700px] w-full max-w-2xl flex-col shadow-xl">
        <CardHeader className="rounded-t-xl border-b bg-white">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Bot className="h-6 w-6 text-primary" />
            TanStack AI Chat
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea ref={scrollRef} className="h-full p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center space-y-2 pt-20 text-slate-400">
                  <Bot className="h-12 w-12 opacity-20" />
                  <p>How can I help you today?</p>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'flex w-full gap-3',
                    m.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'flex max-w-[80%] gap-3',
                      m.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2 text-sm shadow-sm',
                        m.role === 'user'
                          ? 'rounded-tr-none bg-primary text-primary-foreground'
                          : 'rounded-tl-none border border-slate-100 bg-white text-slate-800',
                      )}
                    >
                      {m.parts.map(
                        (part, i) =>
                          part.type === 'text' && (
                            <div key={i} className="whitespace-pre-wrap leading-relaxed">
                              {part.content}
                            </div>
                          ),
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Bot size={16} className="text-muted-foreground" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none border border-slate-100 bg-white px-4 py-2 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="rounded-b-xl border-t bg-white p-4">
          <form onSubmit={handleSend} className="flex w-full gap-2">
            <Input
              placeholder="Message TanStack AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="h-11 flex-1 border-none bg-slate-50 focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="h-11 w-11 shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
