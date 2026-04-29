"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ArrowLeft,
  Bold,
  Italic,
  Link,
  Image,
  Code,
  Shield,
  Lock,
  Save,
  Menu,
  CreditCard,
  KeyRound,
  StickyNote,
  List,
} from "lucide-react"
import CodeMirror from "@uiw/react-codemirror"
import { markdown } from "@codemirror/lang-markdown"
import { oneDark } from "@codemirror/theme-one-dark"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { MarkdownPreview } from "./markdown-preview"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MarkdownEditor() {
  const { documents, selectedDocumentId, updateDocument, selectDocument, toggleSidebar } = useApp()
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const document = documents.find((d) => d.id === selectedDocumentId)
  const [content, setContent] = useState(document?.content || "")

  useEffect(() => {
    if (document) {
      setContent(document.content)
    }
  }, [document])

  // Auto-save every 3 seconds
  useEffect(() => {
    if (!document || content === document.content) return

    setSaveStatus("unsaved")
    const timer = setTimeout(() => {
      setSaveStatus("saving")
      updateDocument(document.id, content)
      setTimeout(() => {
        setSaveStatus("saved")
        setLastSaved(new Date())
      }, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [content, document, updateDocument])

  const handleChange = useCallback((value: string) => {
    setContent(value)
  }, [])

  const insertSyntax = (before: string, after: string = "") => {
    const newContent = content + before + after
    setContent(newContent)
  }

  const insertSpecialElement = (type: "card" | "password" | "note" | "field") => {
    const elements = {
      card: "!!card 4111-1111-1111-1111!!",
      password: "!!password YourSecretHere!!",
      note: "!!note This is a sensitive note!!",
      field: "!!field:Label Value!!",
    }
    insertSyntax("\n" + elements[type] + "\n")
  }

  const formatSaveStatus = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving..."
      case "saved":
        return lastSaved
          ? `Saved ${formatTimeAgo(lastSaved)}`
          : "Saved"
      case "unsaved":
        return "Unsaved changes"
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 10) return "just now"
    if (seconds < 60) return `${seconds}s ago`
    return `${Math.floor(seconds / 60)}m ago`
  }

  if (!document) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No document selected</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectDocument(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="h-6 w-px bg-border" />
          <h2 className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[300px]">
            {document.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              Encrypted at rest (double layer)
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {saveStatus === "saving" && (
              <Save className="h-4 w-4 animate-pulse" />
            )}
            {saveStatus === "saved" && <Save className="h-4 w-4 text-success" />}
            <span className="hidden sm:inline">{formatSaveStatus()}</span>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-border/50 px-4 py-2 overflow-x-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertSyntax("**", "**")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertSyntax("*", "*")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertSyntax("[", "](url)")}
          title="Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertSyntax("![alt](", ")")}
          title="Image"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertSyntax("```\n", "\n```")}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Secure Element</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => insertSpecialElement("card")}>
              <CreditCard className="mr-2 h-4 w-4 text-chart-4" />
              <span>Credit Card</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertSpecialElement("password")}>
              <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Password</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertSpecialElement("note")}>
              <StickyNote className="mr-2 h-4 w-4 text-warning" />
              <span>Secure Note</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertSpecialElement("field")}>
              <List className="mr-2 h-4 w-4 text-accent" />
              <span>Key-Value Field</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Editor and Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane - Editor */}
        <div className="flex-1 overflow-hidden border-r border-border/50">
          <CodeMirror
            value={content}
            height="100%"
            extensions={[markdown()]}
            theme={oneDark}
            onChange={handleChange}
            className="h-full [&_.cm-editor]:h-full [&_.cm-scroller]:!font-mono"
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              foldGutter: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              searchKeymap: true,
              foldKeymap: true,
              completionKeymap: true,
              lintKeymap: true,
            }}
          />
        </div>

        {/* Right Pane - Preview */}
        <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
            <span className="text-sm font-medium text-muted-foreground">Preview</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <MarkdownPreview content={content} />
          </div>
        </div>
      </div>
    </div>
  )
}
