export interface Document {
  id: string
  title: string
  content: string
  lastModified: Date
  folder?: string
  isEncrypted: boolean
}

export interface Folder {
  id: string
  name: string
  parentId?: string
}

export interface EncryptionStatus {
  clientKeyActive: boolean
  pinSet: boolean
  clientKeyPreview?: string
}

export type AppView = 'auth' | 'dashboard' | 'editor'

export interface AppState {
  view: AppView
  isAuthenticated: boolean
  accessMode: "local" | "auth-sync"
  apiBaseUrl: string
  apiKeyConfigured: boolean
  encryptionStatus: EncryptionStatus
  documents: Document[]
  folders: Folder[]
  selectedDocumentId: string | null
  sidebarOpen: boolean
}
