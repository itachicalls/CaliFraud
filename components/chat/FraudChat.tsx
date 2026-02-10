'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFilterStore } from '@/stores/filters'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function FraudChat() {
  const getActiveFilters = useFilterStore((state) => state.getActiveFilters)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm the CaliFraud assistant. Ask me anything about California fraud data — totals, top schemes, worst counties, and more!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setIsLoading(true)

    try {
      const filters = getActiveFilters()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, filters }),
      })
      const data = await res.json()
      const reply = data.response || 'Sorry, I could not get that.'
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Something went wrong. Try again!' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-[340px] left-4 lg:left-[352px] z-20 hidden lg:block">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-80 bg-white rounded-2xl shadow-xl border border-california-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-california-poppy/10 border-b border-california-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-california-poppy flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">Fraud Assistant</p>
                  <p className="text-[10px] text-text-secondary">Powered by CaliFraud data</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-california-sand rounded-lg transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="h-64 overflow-y-auto p-3 space-y-3 scrollbar-hide"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-california-poppy text-white'
                        : 'bg-california-sand text-text-primary'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {msg.content.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                        part.startsWith('**') && part.endsWith('**')
                          ? <strong key={j}>{part.slice(2, -2)}</strong>
                          : part
                      )}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-california-sand rounded-xl px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-california-poppy rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-california-poppy rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-california-poppy rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-california-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about fraud data..."
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-california-border
                    focus:outline-none focus:ring-2 focus:ring-california-poppy/50"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-california-poppy text-white rounded-xl font-medium
                    hover:bg-california-sunset disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-lg border border-california-border
              hover:shadow-xl hover:bg-california-sand/30 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-california-poppy flex items-center justify-center">
              <span className="text-white text-lg">💬</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-text-primary text-sm">Chat with Fraud AI</p>
              <p className="text-[10px] text-text-secondary">Ask about the data</p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
