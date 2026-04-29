"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CardElement, PasswordElement, NoteElement, FieldElement } from "./secure-elements"

interface MarkdownPreviewProps {
  content: string
}

// Parse custom syntax and render special elements
function parseCustomElements(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = []
  let remaining = text
  let keyIndex = 0

  // Regex patterns for custom elements
  const patterns = [
    { regex: /!!card\s+(.+?)!!/g, component: "card" },
    { regex: /!!password\s+(.+?)!!/g, component: "password" },
    { regex: /!!note\s+(.+?)!!/g, component: "note" },
    { regex: /!!field:([^\s]+)\s+(.+?)!!/g, component: "field" },
  ]

  // Find all matches with their positions
  const matches: Array<{
    start: number
    end: number
    component: string
    content: string
    label?: string
  }> = []

  for (const pattern of patterns) {
    const regex = new RegExp(pattern.regex.source, "g")
    let match
    while ((match = regex.exec(text)) !== null) {
      if (pattern.component === "field") {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          component: pattern.component,
          label: match[1],
          content: match[2],
        })
      } else {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          component: pattern.component,
          content: match[1],
        })
      }
    }
  }

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start)

  // Build result with alternating text and components
  let lastEnd = 0
  for (const match of matches) {
    if (match.start > lastEnd) {
      parts.push(text.slice(lastEnd, match.start))
    }

    switch (match.component) {
      case "card":
        parts.push(<CardElement key={`card-${keyIndex++}`}>{match.content}</CardElement>)
        break
      case "password":
        parts.push(<PasswordElement key={`password-${keyIndex++}`}>{match.content}</PasswordElement>)
        break
      case "note":
        parts.push(<NoteElement key={`note-${keyIndex++}`}>{match.content}</NoteElement>)
        break
      case "field":
        parts.push(
          <FieldElement
            key={`field-${keyIndex++}`}
            label={match.label!}
            value={match.content}
          />
        )
        break
    }

    lastEnd = match.end
  }

  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd))
  }

  return parts
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  // First, extract and replace custom elements
  const hasCustomElements = /!!(?:card|password|note|field:)/.test(content)

  if (!hasCustomElements) {
    return (
      <div className="prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-foreground mb-4">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-medium text-foreground mt-4 mb-2">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside text-muted-foreground mb-4 space-y-1">{children}</ol>
            ),
            code: ({ className, children }) => {
              const isInline = !className
              if (isInline) {
                return (
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
                    {children}
                  </code>
                )
              }
              return (
                <code className="block overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                  {children}
                </code>
              )
            },
            pre: ({ children }) => (
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 mb-4">{children}</pre>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground mb-4">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  // Split content by lines and process each
  const lines = content.split("\n")
  const processedContent: JSX.Element[] = []

  let currentMarkdown = ""
  let keyIndex = 0

  const flushMarkdown = () => {
    if (currentMarkdown.trim()) {
      processedContent.push(
        <div key={`md-${keyIndex++}`} className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-foreground mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-medium text-foreground mt-4 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-muted-foreground mb-4 space-y-1">{children}</ol>
              ),
              code: ({ className, children }) => {
                const isInline = !className
                if (isInline) {
                  return (
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
                      {children}
                    </code>
                  )
                }
                return (
                  <code className="block overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                    {children}
                  </code>
                )
              },
              pre: ({ children }) => (
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 mb-4">{children}</pre>
              ),
              a: ({ href, children }) => (
                <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground mb-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {currentMarkdown}
          </ReactMarkdown>
        </div>
      )
      currentMarkdown = ""
    }
  }

  for (const line of lines) {
    if (/!!(?:card|password|note|field:)/.test(line)) {
      flushMarkdown()
      const elements = parseCustomElements(line)
      for (const el of elements) {
        if (typeof el === "string" && el.trim()) {
          currentMarkdown += el + "\n"
        } else if (typeof el !== "string") {
          flushMarkdown()
          processedContent.push(el)
        }
      }
    } else {
      currentMarkdown += line + "\n"
    }
  }

  flushMarkdown()

  return <div>{processedContent}</div>
}
