import "./style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createDocument,
  listDocuments,
  updateDocument,
} from "./lib/api";
import {
  decryptFromStorage,
  encryptForStorage,
  getOrCreateClientKey,
  hasPinConfig,
  setupPin,
  verifyPin,
} from "./lib/crypto";
import { DocumentList } from "./components/document-list";
import { MarkdownEditor } from "./components/markdown-editor";
import { PinModal } from "./components/pin-modal";
import { SettingsPanel } from "./components/settings-panel";
import { Sidebar } from "./components/sidebar";
import type { TLocalDocument, TSyncState } from "./types";

type TToast = {
  id: number;
  message: string;
  kind: "success" | "error" | "info";
};

type TLockState = "loading" | "setup" | "verify" | "unlocked";

function buildSnapshot(title: string, plaintext: string): string {
  return `${title}\n${plaintext}`;
}

function deriveTitle(markdown: string): string {
  const firstContentLine = markdown
    .split("\n")
    .map((line) => line.trim().replace(/^#+\s*/, ""))
    .find((line) => line.length > 0);

  return firstContentLine ? firstContentLine.slice(0, 80) : "Untitled";
}

function App() {
  const [lockState, setLockState] = useState<TLockState>("loading");
  const [syncState, setSyncState] = useState<TSyncState>("idle");
  const [syncMessage, setSyncMessage] = useState("");
  const [clientKey, setClientKey] = useState<Uint8Array | null>(null);
  const [pinKey, setPinKey] = useState<Uint8Array | null>(null);
  const [documents, setDocuments] = useState<TLocalDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftMarkdown, setDraftMarkdown] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinConfirmInput, setPinConfirmInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<TToast[]>([]);
  const savedSnapshotRef = useRef("");
  const toastIdRef = useRef(0);

  const pushToast = useCallback((message: string, kind: TToast["kind"] = "info") => {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((previous) => [...previous, { id, message, kind }]);

    window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, 2200);
  }, []);

  const selectedDocument = useMemo(
    () => documents.find((item) => item.id === selectedDocumentId) ?? null,
    [documents, selectedDocumentId],
  );

  const loadDocuments = useCallback(async () => {
    if (!clientKey || !pinKey) {
      return;
    }

    setLoadError("");
    setSyncState("loading");

    try {
      const serverDocuments = await listDocuments();
      const decryptedDocuments = await Promise.all(
        serverDocuments.map(async (document) => {
          const plaintext = await decryptFromStorage(
            document.encryptedContent,
            document.iv,
            document.authTag,
            clientKey,
            pinKey,
          );

          return {
            ...document,
            plaintext,
            isNew: false,
          };
        }),
      );

      setDocuments(decryptedDocuments);
      setSelectedDocumentId((currentSelectedId) => {
        if (currentSelectedId && decryptedDocuments.some((item) => item.id === currentSelectedId)) {
          return currentSelectedId;
        }

        return decryptedDocuments[0]?.id ?? null;
      });
      setSyncState("idle");
      setSyncMessage("");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load encrypted documents from the API.";
      setLoadError(message);
      setSyncState("error");
      setSyncMessage(message);
      pushToast(message, "error");
    }
  }, [clientKey, pinKey, pushToast]);

  useEffect(() => {
    void (async () => {
      try {
        const key = await getOrCreateClientKey();
        setClientKey(key);
        setLockState(hasPinConfig() ? "verify" : "setup");
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to initialize vault keys.";
        setPinError(message);
        setLockState("verify");
      }
    })();
  }, []);

  useEffect(() => {
    if (lockState !== "unlocked") {
      return;
    }

    void loadDocuments();
  }, [loadDocuments, lockState]);

  useEffect(() => {
    if (!selectedDocument) {
      setDraftTitle("");
      setDraftMarkdown("");
      savedSnapshotRef.current = "";
      return;
    }

    setDraftTitle(selectedDocument.title);
    setDraftMarkdown(selectedDocument.plaintext);
    savedSnapshotRef.current = buildSnapshot(selectedDocument.title, selectedDocument.plaintext);
  }, [selectedDocument]);

  useEffect(() => {
    if (lockState !== "unlocked" || !clientKey || !pinKey || !selectedDocument) {
      return;
    }

    const currentSnapshot = buildSnapshot(draftTitle, draftMarkdown);

    if (currentSnapshot === savedSnapshotRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void (async () => {
        try {
          setSyncState("encrypting");
          setSyncMessage("");

          const title = draftTitle.trim() ? draftTitle.trim() : deriveTitle(draftMarkdown);
          const encryptedPayload = await encryptForStorage(draftMarkdown, clientKey, pinKey);
          setSyncState("saving");

          const persisted = selectedDocument.isNew
            ? await createDocument({
                id: selectedDocument.id,
                title,
                encryptedContent: encryptedPayload.encryptedContent,
                iv: encryptedPayload.iv,
                authTag: encryptedPayload.authTag,
              })
            : await updateDocument(selectedDocument.id, {
                title,
                encryptedContent: encryptedPayload.encryptedContent,
                iv: encryptedPayload.iv,
                authTag: encryptedPayload.authTag,
              });

          setDocuments((previous) =>
            previous.map((item) =>
              item.id === selectedDocument.id
                ? {
                    ...persisted,
                    plaintext: draftMarkdown,
                    isNew: false,
                  }
                : item,
            ),
          );

          if (title !== draftTitle) {
            setDraftTitle(title);
          }

          savedSnapshotRef.current = buildSnapshot(title, draftMarkdown);
          setSyncState("saved");
          setSyncMessage("Encrypted and synced.");
          pushToast("Document encrypted and saved.", "success");
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to encrypt and save document.";
          setSyncState("error");
          setSyncMessage(message);
          pushToast(message, "error");
        }
      })();
    }, 3000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [clientKey, draftMarkdown, draftTitle, lockState, pinKey, pushToast, selectedDocument]);

  const handlePinSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPinError("");

      if (!pinInput.trim()) {
        setPinError("PIN is required.");
        return;
      }

      if (lockState === "setup") {
        if (pinInput !== pinConfirmInput) {
          setPinError("PIN confirmation does not match.");
          return;
        }

        const createdPinKey = await setupPin(pinInput);
        setPinKey(createdPinKey);
        setPinInput("");
        setPinConfirmInput("");
        setLockState("unlocked");
        return;
      }

      const verifiedPinKey = await verifyPin(pinInput);
      if (!verifiedPinKey) {
        setPinError("Invalid PIN.");
        return;
      }

      setPinKey(verifiedPinKey);
      setPinInput("");
      setPinConfirmInput("");
      setLockState("unlocked");
    },
    [lockState, pinConfirmInput, pinInput],
  );

  const handleCreateDocument = useCallback(() => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const newDocument: TLocalDocument = {
      id,
      title: "Untitled",
      plaintext: "",
      encryptedContent: "",
      iv: "",
      authTag: "",
      createdAt: now,
      updatedAt: now,
      isNew: true,
    };

    setDocuments((previous) => [newDocument, ...previous]);
    setSelectedDocumentId(id);
    setSyncState("idle");
    setSyncMessage("");
    pushToast("Draft document created.", "info");
  }, [pushToast]);

  const handleExportBackup = useCallback(() => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      documents: documents.map((document) => ({
        id: document.id,
        title: document.title,
        markdown: document.plaintext,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      })),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `sese-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);

    pushToast("Backup exported.", "success");
  }, [documents, pushToast]);

  const statusText = useMemo(() => {
    if (lockState !== "unlocked") {
      return "Vault locked";
    }

    switch (syncState) {
      case "loading":
        return "Loading encrypted documents...";
      case "encrypting":
        return "Encrypting...";
      case "saving":
        return "Saving...";
      case "saved":
        return syncMessage || "Saved";
      case "error":
        return syncMessage || "Sync failed";
      case "idle":
      default:
        return "Ready";
    }
  }, [lockState, syncMessage, syncState]);

  return (
    <main className="app">
      {(lockState === "loading" || lockState === "setup" || lockState === "verify") && (
        <PinModal
          mode={lockState === "setup" ? "setup" : "verify"}
          pinInput={pinInput}
          pinConfirmInput={pinConfirmInput}
          pinError={pinError}
          onPinInputChange={setPinInput}
          onPinConfirmInputChange={setPinConfirmInput}
          onSubmit={(event) => void handlePinSubmit(event)}
        />
      )}

      <section className="v0-layout">
        <Sidebar onSettingsClick={() => setSettingsOpen(true)} />

        <DocumentList
          documents={documents}
          selectedDocumentId={selectedDocumentId}
          onSelectDocument={setSelectedDocumentId}
          onCreateDocument={handleCreateDocument}
        />

        <div className="editor-shell">
          {loadError ? (
            <div className="error-card">
              <p>{loadError}</p>
              <button type="button" onClick={() => void loadDocuments()}>
                Retry
              </button>
            </div>
          ) : (
            <MarkdownEditor
              title={draftTitle}
              markdownValue={draftMarkdown}
              disabled={!selectedDocument}
              statusText={statusText}
              onTitleChange={setDraftTitle}
              onMarkdownChange={setDraftMarkdown}
              onToast={(message) => pushToast(message, "info")}
            />
          )}
        </div>
      </section>

      <SettingsPanel
        open={settingsOpen}
        documents={documents}
        onClose={() => setSettingsOpen(false)}
        onExportBackup={handleExportBackup}
      />

      <aside className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.kind}`}>
            {toast.message}
          </div>
        ))}
      </aside>
    </main>
  );
}

export default App;
