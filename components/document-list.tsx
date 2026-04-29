"use client"

import { useState } from "react"
import {
  Search,
  Lock,
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  Clock,
  CheckSquare,
  Square,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { cn } from "@/lib/utils"

export function DocumentList() {
  const { documents, selectDocument, createDocument, deleteDocuments } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filteredDocs = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === filteredDocs.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredDocs.map((d) => d.id)))
    }
  }

  const handleDelete = () => {
    deleteDocuments(Array.from(selectedIds))
    setSelectedIds(new Set())
  }

  const handleNewDocument = () => {
    const doc = createDocument("Untitled Document")
    selectDocument(doc.id)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border/50 p-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Your Documents</h1>
          <p className="text-sm text-muted-foreground">
            {documents.length} encrypted documents
          </p>
        </div>
        <Button onClick={handleNewDocument} className="gap-2">
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </header>

      <div className="flex items-center gap-4 border-b border-border/50 px-6 py-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/30 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear ({selectedIds.size})
            </Button>
            <Button variant="secondary" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Re-encrypt
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filteredDocs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="rounded-full bg-muted/50 p-6 mb-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Create your first encrypted document"}
            </p>
            {!searchQuery && (
              <Button onClick={handleNewDocument} className="gap-2">
                <Plus className="h-4 w-4" />
                New Document
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-4 py-2">
              <button
                onClick={selectAll}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {selectedIds.size === filteredDocs.length ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Select All
              </span>
            </div>

            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "glass group flex items-center gap-4 rounded-xl p-4 transition-all hover:bg-muted/30 cursor-pointer",
                  selectedIds.has(doc.id) && "ring-2 ring-primary"
                )}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSelect(doc.id)
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {selectedIds.has(doc.id) ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5" />
                  )}
                </button>

                <div
                  className="flex flex-1 items-center gap-4"
                  onClick={() => selectDocument(doc.id)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {doc.content.replace(/[#!`*_\[\]]/g, "").slice(0, 80)}...
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(doc.lastModified)}</span>
                    </div>

                    {doc.isEncrypted && (
                      <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
                        <Lock className="h-3.5 w-3.5 text-primary" />
                        <Lock className="h-3.5 w-3.5 text-primary -ml-1" />
                        <span className="text-xs font-medium text-primary">
                          Double Encrypted
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for mobile */}
      <button
        onClick={handleNewDocument}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors lg:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
