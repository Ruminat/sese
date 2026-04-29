"use client"

import { useState } from "react"
import {
  X,
  Key,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { toast } from "sonner"

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { encryptionStatus, changePin, documents } = useApp()
  const [showChangePin, setShowChangePin] = useState(false)
  const [newPin, setNewPin] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isReencrypting, setIsReencrypting] = useState(false)

  if (!open) return null

  const handleChangePin = () => {
    if (newPin.length >= 4 && newPin.length <= 6) {
      setIsReencrypting(true)
      // Simulate re-encryption
      setTimeout(() => {
        changePin(newPin)
        setIsReencrypting(false)
        setShowChangePin(false)
        setNewPin("")
        toast.success("PIN changed successfully! All documents re-encrypted.")
      }, 2000)
    } else {
      toast.error("PIN must be 4-6 digits")
    }
  }

  const handleExportBackup = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      documents: documents.map((d) => ({
        id: d.id,
        title: d.title,
        encrypted: true,
      })),
      note: "This is a simulated encrypted backup",
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `securevault-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Encrypted backup downloaded!")
  }

  const handleDeleteAll = () => {
    if (confirmDelete) {
      toast.success("All data deleted (simulated)")
      setConfirmDelete(false)
      onClose()
    } else {
      setConfirmDelete(true)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md glass-strong border-l border-border/50 animate-in slide-in-from-right duration-300">
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-border/50 p-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Encryption Settings
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your security configuration
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Encryption Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">
                Encryption Status
              </h3>

              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Client Key
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Layer 1 encryption
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {encryptionStatus.clientKeyActive && (
                      <>
                        <code className="rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
                          {encryptionStatus.clientKeyPreview}...
                        </code>
                        <Check className="h-5 w-5 text-success" />
                      </>
                    )}
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">PIN</p>
                      <p className="text-xs text-muted-foreground">
                        Layer 2 encryption
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {encryptionStatus.pinSet && (
                      <>
                        <span className="text-sm text-muted-foreground">••••</span>
                        <Check className="h-5 w-5 text-success" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Change PIN */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Change PIN</h3>

              {showChangePin ? (
                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    All documents will be re-encrypted with your new PIN.
                  </p>
                  <input
                    type="password"
                    placeholder="Enter new PIN (4-6 digits)"
                    value={newPin}
                    onChange={(e) =>
                      setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowChangePin(false)
                        setNewPin("")
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleChangePin}
                      disabled={isReencrypting}
                      className="flex-1 gap-2"
                    >
                      {isReencrypting && (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      )}
                      {isReencrypting ? "Re-encrypting..." : "Change PIN"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setShowChangePin(true)}
                  className="w-full justify-start gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Change PIN
                </Button>
              )}
            </div>

            {/* Export Backup */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Backup</h3>
              <Button
                variant="secondary"
                onClick={handleExportBackup}
                className="w-full justify-start gap-2"
              >
                <Download className="h-4 w-4" />
                Export Encrypted Backup
              </Button>
              <p className="text-xs text-muted-foreground">
                Download all documents as an encrypted backup file.
              </p>
            </div>

            {/* Danger Zone */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-destructive">
                Danger Zone
              </h3>

              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Delete All Data
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This action cannot be undone. All documents and encryption
                      keys will be permanently deleted.
                    </p>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  onClick={handleDeleteAll}
                  className="w-full gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {confirmDelete ? "Click again to confirm" : "Delete All Data"}
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-border/50 px-6 py-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Documents encrypted: {documents.length}</span>
              <span>Encryption: AES-256-GCM (simulated)</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
