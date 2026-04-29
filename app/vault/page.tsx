"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AppProvider, useApp } from "@/lib/app-context"
import { PinModal } from "@/components/pin-modal"
import { Sidebar } from "@/components/sidebar"
import { DocumentList } from "@/components/document-list"
import { MarkdownEditor } from "@/components/markdown-editor"
import { SettingsPanel } from "@/components/settings-panel"
import { useHydratedAccessConfig } from "@/lib/access-mode"

function VaultContent() {
  const { isAuthenticated, selectedDocumentId } = useApp()
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!isAuthenticated) {
    return <PinModal />
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onSettingsClick={() => setSettingsOpen(true)} />

      <main className="flex-1 overflow-hidden">
        {selectedDocumentId ? <MarkdownEditor /> : <DocumentList />}
      </main>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default function VaultPage() {
  const router = useRouter()
  const { config, hydrated } = useHydratedAccessConfig()

  const canEnterVault = useMemo(() => {
    if (!config.mode) {
      return false
    }

    if (config.mode === "local") {
      return true
    }

    return Boolean(config.apiUrl)
  }, [config.apiUrl, config.mode])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    if (!config.mode) {
      router.replace("/")
      return
    }

    if (config.mode === "auth-sync" && !config.apiUrl) {
      router.replace("/auth")
    }
  }, [config.apiUrl, config.mode, hydrated, router])

  if (!hydrated || !canEnterVault) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Checking access mode...</p>
      </main>
    )
  }

  return (
    <AppProvider bootstrapAccessConfig={config}>
      <VaultContent />
    </AppProvider>
  )
}
