"use client"

import { useState } from "react"
import { Lock, Eye, EyeOff, Copy, Check, CreditCard, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SecureElementProps {
  children: string
}

export function CardElement({ children }: SecureElementProps) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const cardNumber = children.trim()
  const masked = cardNumber.replace(/\d(?=\d{4})/g, "•")
  const formatted = cardNumber.replace(/(.{4})/g, "$1 ").trim()
  const maskedFormatted = masked.replace(/(.{4})/g, "$1 ").trim()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cardNumber)
    setCopied(true)
    toast.success("Card number copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 overflow-hidden rounded-xl bg-gradient-to-br from-chart-4/20 via-primary/20 to-chart-4/10 p-4 border border-chart-4/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/20">
            <CreditCard className="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Credit Card</p>
            <p className={cn(
              "font-mono text-lg tracking-wider text-foreground",
              revealed && "reveal-animate"
            )}>
              {revealed ? formatted : maskedFormatted}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRevealed(!revealed)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={revealed ? "Hide" : "Reveal"}
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={handleCopy}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Copy"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20" title="Client-encrypted">
            <Lock className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PasswordElement({ children }: SecureElementProps) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const password = children.trim()
  const masked = "•".repeat(Math.min(password.length, 16))

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password)
    setCopied(true)
    toast.success("Password copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 overflow-hidden rounded-xl bg-password-bg p-4 border border-border">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Password</p>
            <p className={cn(
              "font-mono text-lg text-foreground",
              revealed && "reveal-animate"
            )}>
              {revealed ? password : masked}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRevealed(!revealed)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={revealed ? "Hide" : "Reveal"}
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={handleCopy}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Copy"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20" title="Client-encrypted">
            <Lock className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function NoteElement({ children }: SecureElementProps) {
  const [copied, setCopied] = useState(false)
  const note = children.trim()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(note)
    setCopied(true)
    toast.success("Note copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group my-3 overflow-hidden rounded-xl bg-note-bg p-4 border border-warning/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <div>
            <p className="text-xs text-note-foreground/70 mb-1">Secure Note</p>
            <p className="text-sm text-note-foreground leading-relaxed">{note}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20 text-warning hover:bg-warning/30 transition-colors"
            title="Copy"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20" title="Client-encrypted">
            <Lock className="h-4 w-4 text-warning" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface FieldElementProps {
  label: string
  value: string
}

export function FieldElement({ label, value }: FieldElementProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success(`${label} copied!`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-2 flex items-center justify-between gap-4 rounded-lg bg-accent/10 px-4 py-3 border border-accent/30">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-sm font-medium text-accent shrink-0">{label}:</span>
        <span className="font-mono text-sm text-foreground truncate">{value}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleCopy}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
          title="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20" title="Client-encrypted">
          <Lock className="h-3.5 w-3.5 text-primary" />
        </div>
      </div>
    </div>
  )
}
