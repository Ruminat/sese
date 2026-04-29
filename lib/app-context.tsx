"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { AccessConfig } from "./access-mode"
import type { Document, Folder, EncryptionStatus, AppView, AppState } from "./types"

// Mock data for demonstration
const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Payment Credentials",
    content: `# Payment Credentials

Store all payment information securely.

## Credit Cards

!!card 4111-1111-1111-1111!!

## API Keys

!!password sk_live_abc123xyz789!!

!!note Remember to rotate these keys monthly!!

## Bank Details

!!field:Account Number 1234567890!!
!!field:Routing Number 021000021!!`,
    lastModified: new Date(Date.now() - 1000 * 60 * 30),
    folder: "finance",
    isEncrypted: true,
  },
  {
    id: "2",
    title: "Server Passwords",
    content: `# Server Credentials

## Production Server

!!field:Host prod.example.com!!
!!field:Username admin!!
!!password SuperSecure@2024!!

## Staging Server

!!field:Host staging.example.com!!
!!field:Username deploy!!
!!password Staging#Pass123!!

!!note Always use VPN when connecting!!`,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2),
    folder: "servers",
    isEncrypted: true,
  },
  {
    id: "3",
    title: "Personal Notes",
    content: `# Personal Notes

Just some regular markdown content here.

- Item one
- Item two
- Item three

## Code Example

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\``,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isEncrypted: true,
  },
]

const mockFolders: Folder[] = [
  { id: "finance", name: "Finance" },
  { id: "servers", name: "Servers" },
  { id: "personal", name: "Personal" },
]

interface AppContextType extends AppState {
  setView: (view: AppView) => void
  authenticate: (pin: string) => boolean
  logout: () => void
  selectDocument: (id: string | null) => void
  updateDocument: (id: string, content: string) => void
  createDocument: (title: string, folder?: string) => Document
  deleteDocuments: (ids: string[]) => void
  toggleSidebar: () => void
  generateClientKey: () => string
  changePin: (newPin: string) => boolean
  getApiClientBootstrap: () => {
    enabled: boolean
    baseUrl: string
    headers: Record<string, string>
  }
}

const AppContext = createContext<AppContextType | null>(null)

type AppProviderProps = {
  children: ReactNode
  bootstrapAccessConfig?: AccessConfig
}

export function AppProvider({ children, bootstrapAccessConfig }: AppProviderProps) {
  const [state, setState] = useState<AppState>({
    view: "auth",
    isAuthenticated: false,
    accessMode: bootstrapAccessConfig?.mode ?? "local",
    apiBaseUrl: bootstrapAccessConfig?.apiUrl ?? "",
    apiKeyConfigured: Boolean(bootstrapAccessConfig?.apiKey),
    encryptionStatus: {
      clientKeyActive: true,
      pinSet: true,
      clientKeyPreview: "a1b2c3d4",
    },
    documents: mockDocuments,
    folders: mockFolders,
    selectedDocumentId: null,
    sidebarOpen: true,
  })

  const setView = useCallback((view: AppView) => {
    setState((prev) => ({ ...prev, view }))
  }, [])

  const authenticate = useCallback((pin: string) => {
    // Mock authentication - in real app this would verify against encrypted PIN
    if (pin.length >= 4 && pin.length <= 6) {
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        view: "dashboard",
      }))
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      view: "auth",
      selectedDocumentId: null,
    }))
  }, [])

  const selectDocument = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedDocumentId: id,
      view: id ? "editor" : "dashboard",
    }))
  }, [])

  const updateDocument = useCallback((id: string, content: string) => {
    setState((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === id
          ? { ...doc, content, lastModified: new Date() }
          : doc
      ),
    }))
  }, [])

  const createDocument = useCallback((title: string, folder?: string) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      title,
      content: `# ${title}\n\nStart writing here...`,
      lastModified: new Date(),
      folder,
      isEncrypted: true,
    }
    setState((prev) => ({
      ...prev,
      documents: [newDoc, ...prev.documents],
    }))
    return newDoc
  }, [])

  const deleteDocuments = useCallback((ids: string[]) => {
    setState((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => !ids.includes(doc.id)),
      selectedDocumentId: ids.includes(prev.selectedDocumentId || "")
        ? null
        : prev.selectedDocumentId,
    }))
  }, [])

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))
  }, [])

  const generateClientKey = useCallback(() => {
    const key = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")
    setState((prev) => ({
      ...prev,
      encryptionStatus: {
        ...prev.encryptionStatus,
        clientKeyActive: true,
        clientKeyPreview: key.slice(0, 8),
      },
    }))
    return key
  }, [])

  const changePin = useCallback((newPin: string) => {
    if (newPin.length >= 4 && newPin.length <= 6) {
      // In real app, this would re-encrypt all documents
      return true
    }
    return false
  }, [])

  const getApiClientBootstrap = useCallback(() => {
    if (state.accessMode === "local") {
      return {
        enabled: false,
        baseUrl: "",
        headers: {},
      }
    }

    return {
      enabled: true,
      baseUrl: state.apiBaseUrl,
      headers: state.apiKeyConfigured ? { "x-api-key": "configured-in-client-storage" } : {},
    }
  }, [state.accessMode, state.apiBaseUrl, state.apiKeyConfigured])

  return (
    <AppContext.Provider
      value={{
        ...state,
        setView,
        authenticate,
        logout,
        selectDocument,
        updateDocument,
        createDocument,
        deleteDocuments,
        toggleSidebar,
        generateClientKey,
        changePin,
        getApiClientBootstrap,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
