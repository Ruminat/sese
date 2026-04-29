"use client"

import { useState } from "react"
import {
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
  Lock,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { cn } from "@/lib/utils"

interface SidebarProps {
  onSettingsClick: () => void
}

export function Sidebar({ onSettingsClick }: SidebarProps) {
  const {
    documents,
    folders,
    selectedDocumentId,
    selectDocument,
    logout,
    sidebarOpen,
    accessMode,
    apiBaseUrl,
    apiKeyConfigured,
  } = useApp()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(folders.map((f) => f.id))
  )

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const unfiledDocs = documents.filter((doc) => !doc.folder)

  if (!sidebarOpen) return null

  return (
    <aside className="glass-strong flex h-full w-64 shrink-0 flex-col border-r border-border/50">
      <div className="flex items-center gap-3 border-b border-border/50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">SecureVault</h1>
          <p className="text-xs text-muted-foreground">Encrypted Documents</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="mb-4">
          <Button
            variant="secondary"
            className="w-full justify-start gap-2"
            onClick={() => selectDocument(null)}
          >
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </div>

        <div className="space-y-1">
          {folders.map((folder) => {
            const folderDocs = documents.filter((doc) => doc.folder === folder.id)
            const isExpanded = expandedFolders.has(folder.id)

            return (
              <div key={folder.id}>
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Folder className="h-4 w-4" />
                  <span>{folder.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {folderDocs.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="ml-4 space-y-1 border-l border-border/50 pl-2">
                    {folderDocs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => selectDocument(doc.id)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                          selectedDocumentId === doc.id
                            ? "bg-primary/20 text-primary"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{doc.title}</span>
                        {doc.isEncrypted && (
                          <Lock className="ml-auto h-3 w-3 text-muted-foreground" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {unfiledDocs.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Unfiled
              </p>
              {unfiledDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => selectDocument(doc.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    selectedDocumentId === doc.id
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  <span className="truncate">{doc.title}</span>
                  {doc.isEncrypted && (
                    <Lock className="ml-auto h-3 w-3 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-border/50 p-3 space-y-1">
        <button
          onClick={onSettingsClick}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span>Encryption Settings</span>
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Lock Vault</span>
        </button>
      </div>

      <div className="border-t border-border/50 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{accessMode === "local" ? "Local Mode" : "Auth / Sync"}</span>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                accessMode === "local" || apiBaseUrl ? "bg-success animate-pulse" : "bg-warning",
              )}
            />
            <span>
              {accessMode === "local"
                ? "device-only"
                : apiBaseUrl
                  ? `${apiKeyConfigured ? "api key" : "no api key"}`
                  : "missing api url"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
