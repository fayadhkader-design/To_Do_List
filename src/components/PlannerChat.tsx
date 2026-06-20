import { useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Task } from '../types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface PlannerChatProps {
  session: Session
  tasks: Task[]
}

const STARTERS = [
  'What should I prioritize tomorrow?',
  'Help me plan a balanced day.',
  'What can I move if I feel overwhelmed?',
]

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function FormattedMessage({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\s*\n/)
  return (
    <>
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
        const isList = lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line))
        if (isList) {
          return (
            <ul key={blockIndex}>
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{renderInlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }
        return <p key={blockIndex}>{lines.map((line, lineIndex) => <span key={lineIndex}>{renderInlineMarkdown(line)}{lineIndex < lines.length - 1 && <br />}</span>)}</p>
      })}
    </>
  )
}

export function PlannerChat({ session, tasks }: PlannerChatProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hey! I’m your Carolina Companion. Ask me what to prioritize, how to balance a busy day, or where to begin.',
    },
  ])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  async function askPlanner(question: string) {
    const content = question.trim()
    if (!content || busy) return
    const nextMessages = [...messages, { role: 'user' as const, content }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setBusy(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: nextMessages.slice(-10),
          tasks: tasks.map(({ title, notes, dueDate, priority, category, completed }) => ({
            title, notes, dueDate, priority, category, completed,
          })),
        }),
      })
      const result = await response.json() as { message?: string; error?: string }
      if (!response.ok) throw new Error(result.error || 'The assistant could not answer.')
      setMessages((current) => [...current, { role: 'assistant', content: result.message ?? '' }])
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The assistant could not answer.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button className="chat-launcher" onClick={() => setOpen(true)} aria-label="Open Carolina Companion">
        <span aria-hidden="true">✦</span>
        <span><small>Ask your</small>Carolina Companion</span>
      </button>

      {open && (
        <div className="chat-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false)
        }}>
          <section className="chat-panel" role="dialog" aria-modal="true" aria-labelledby="chat-title">
            <header className="chat-header">
              <div className="chat-avatar" aria-hidden="true">✦</div>
              <div>
                <p className="eyebrow">Thoughtful planning</p>
                <h2 id="chat-title">Carolina Companion</h2>
              </div>
              <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
            </header>

            <div className="chat-messages" aria-live="polite">
              {messages.map((message, index) => (
                <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                  {message.role === 'assistant' ? <FormattedMessage content={message.content} /> : message.content}
                </div>
              ))}
              {messages.length === 1 && (
                <div className="chat-starters">
                  {STARTERS.map((starter) => <button key={starter} onClick={() => askPlanner(starter)}>{starter}</button>)}
                </div>
              )}
              {busy && <div className="chat-message assistant thinking">Thinking it through…</div>}
              {error && <p className="chat-error" role="alert">{error}</p>}
              <div ref={endRef} />
            </div>

            <form className="chat-form" onSubmit={(event) => {
              event.preventDefault()
              askPlanner(input)
            }}>
              <label className="sr-only" htmlFor="planner-question">Ask your planning question</label>
              <textarea
                id="planner-question"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    askPlanner(input)
                  }
                }}
                placeholder="What should I prioritize tomorrow?"
                maxLength={2000}
                rows={2}
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send question">→</button>
            </form>
            <p className="chat-note">Advice only—your companion never changes tasks for you.</p>
          </section>
        </div>
      )}
    </>
  )
}
